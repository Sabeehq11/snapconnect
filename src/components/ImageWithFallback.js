import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { colors } from '../utils/colors';
import { imageDebugger } from '../utils/imageDebugger';

const ImageWithFallback = ({
  mediaUrl,
  messageId = 'unknown',
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  showFallback = true,
  children,
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Process the image URL with comprehensive diagnostics
  useEffect(() => {
    const processImageUrl = async () => {
      if (!mediaUrl) {
        console.log('❌ No mediaUrl provided for message:', messageId);
        setHasError(true);
        setErrorDetails({ type: 'no_url', message: 'No image URL provided' });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      setErrorDetails(null);

      console.log('🖼️ Processing image URL for message:', messageId, 'URL:', mediaUrl);

      try {
        let processedUrl = null;

        // Step 1: Check if it's already a valid HTTP URL
        if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
          console.log('✅ Using existing public URL:', mediaUrl);
          processedUrl = mediaUrl;
        } 
        // Step 2: Handle local file URLs by converting to Supabase public URLs
        else if (mediaUrl.startsWith('file://')) {
          console.error('❌ Local file URL detected in database - upload process failed!');
          console.error('❌ This should be a proper HTTPS URL, not a local file path');
          console.error('❌ Bad URL:', mediaUrl);
          setHasError(true);
          setErrorDetails({
            type: 'upload_failed',
            message: 'Upload process failed - local file URL found in database',
            originalUrl: mediaUrl,
            recommendation: 'The image was not properly uploaded to Supabase storage'
          });
          setIsLoading(false);
          return;
        }
        // Step 3: Handle relative paths by generating public URLs
        else {
          // Don't try to process local file URLs - they should have been caught earlier
          if (mediaUrl.startsWith('file://')) {
            console.error('❌ Local file URL reached relative path handler:', mediaUrl);
            setHasError(true);
            setErrorDetails({
              type: 'upload_failed',
              message: 'Upload process failed - local file URL found in database',
              originalUrl: mediaUrl,
              recommendation: 'The image was not properly uploaded to Supabase storage'
            });
            setIsLoading(false);
            return;
          }
          
          console.log('🔄 Generating public URL for file path:', mediaUrl);
          const { data: publicData } = supabase.storage
            .from('media')
            .getPublicUrl(mediaUrl);
          
          if (publicData?.publicUrl) {
            console.log('🔗 Generated public URL:', publicData.publicUrl);
            processedUrl = publicData.publicUrl;
          }
        }

        if (processedUrl) {
          // Step 4: Test URL accessibility
          const urlTest = await imageDebugger.testUrlAccessibility(processedUrl, messageId);
          
          if (urlTest.accessible) {
            setImageUrl(processedUrl);
            console.log('✅ URL verified and set for message:', messageId);
          } else {
            console.error('❌ URL not accessible:', urlTest.error);
            setHasError(true);
            setErrorDetails({
              type: 'url_not_accessible',
              message: urlTest.error,
              status: urlTest.status,
              url: processedUrl
            });
          }
        } else {
          setHasError(true);
          setErrorDetails({
            type: 'url_processing_failed',
            message: 'Failed to process image URL',
            originalUrl: mediaUrl
          });
        }
      } catch (error) {
        console.error('❌ Error processing image URL:', error);
        setHasError(true);
        setErrorDetails({
          type: 'processing_error',
          message: error.message,
          originalUrl: mediaUrl
        });
      } finally {
        setIsLoading(false);
      }
    };

    processImageUrl();
  }, [mediaUrl, messageId, retryCount]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully for message:', messageId);
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  };

  const handleImageError = (error) => {
    console.log('🔄 Image loading started for message:', messageId, 'URL:', imageUrl);
    console.error('❌ Image failed to load for message:', messageId);
    console.error('❌ Error details:', error.nativeEvent || error);
    console.error('❌ Current imageUrl:', imageUrl);
    console.error('❌ Original mediaUrl:', mediaUrl);
    
    // Check if this is a 0-byte file error
    let errorMessage = error.nativeEvent?.error || 'Image failed to load';
    let errorType = 'image_load_error';
    
    if (error.nativeEvent && error.nativeEvent.httpResponseHeaders) {
      const contentLength = error.nativeEvent.httpResponseHeaders['Content-Length'];
      if (contentLength === '0') {
        errorMessage = 'Image file is empty (0 bytes) - upload was corrupted';
        errorType = 'empty_file';
        console.error('🚨 EMPTY FILE DETECTED - Content-Length: 0');
      }
    }
    
    setIsLoading(false);
    setHasError(true);
    setErrorDetails({
      type: errorType,
      message: errorMessage,
      nativeError: error.nativeEvent,
      currentUrl: imageUrl,
      originalUrl: mediaUrl
    });
    
    if (onError) onError(error);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying image load for message:', messageId);
    setRetryCount(prev => prev + 1);
  };

  const FallbackUI = () => (
    <View style={[style, styles.fallbackContainer]}>
      <View style={styles.fallbackContent}>
        <Ionicons 
          name="camera-outline" 
          size={32} 
          color={colors.textSecondary} 
        />
        <Text style={styles.fallbackText}>Image unavailable</Text>
        {errorDetails && (
          <Text style={styles.errorDetailsText}>
            {errorDetails.type === 'empty_file'
              ? 'File corrupted - uploaded as 0 bytes'
              : errorDetails.type === 'upload_failed'
              ? 'Upload failed - image not properly saved'
              : errorDetails.type === 'url_not_accessible' && errorDetails.status === 403 
              ? 'Access forbidden - check storage policies'
              : errorDetails.type === 'url_not_accessible' && errorDetails.status === 404
              ? 'File not found - check if file exists'
              : errorDetails.type === 'no_url'
              ? 'No image provided'
              : 'Loading failed'}
          </Text>
        )}
        {retryCount < 2 && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );

  const LoadingUI = () => (
    <View style={[style, styles.loadingContainer]}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
      {children}
    </View>
  );

  // Show loading state
  if (isLoading) {
    return <LoadingUI />;
  }

  // Show error fallback
  if (hasError && showFallback) {
    return <FallbackUI />;
  }

  // Show the image
  if (imageUrl && !hasError) {
    return (
      <View style={style}>
        <Image
          source={{ uri: imageUrl }}
          style={style}
          resizeMode={resizeMode}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={() => {
            console.log('🔄 Image loading started for message:', messageId, 'URL:', imageUrl);
          }}
          onLoadEnd={() => {
            console.log('🏁 Image loading ended for message:', messageId);
          }}
          {...props}
        />
        {children}
      </View>
    );
  }

  // Default fallback if no showFallback
  return (
    <View style={[style, styles.fallbackContainer]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  fallbackContent: {
    alignItems: 'center',
    gap: 8,
  },
  fallbackText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  errorDetailsText: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  retryText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    gap: 8,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default ImageWithFallback; 