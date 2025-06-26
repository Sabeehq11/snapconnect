import React, { useState, useEffect, useRef } from 'react';
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

// URL cache to prevent redundant processing
const urlCache = new Map();

// Cache cleanup - remove old entries periodically
const cleanupCache = () => {
  if (urlCache.size > 100) {
    const entries = Array.from(urlCache.entries());
    // Keep only the last 50 entries
    urlCache.clear();
    entries.slice(-50).forEach(([key, value]) => {
      urlCache.set(key, value);
    });
  }
};

// Run cleanup every 100 cache additions
let cacheAddCount = 0;

const ImageWithFallback = ({
  mediaUrl,
  messageId = 'unknown',
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  showFallback = true,
  fallbackComponent = null,
  children,
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const processedRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Process the image URL with caching and optimization
  useEffect(() => {
    const processImageUrl = async () => {
      if (!mediaUrl || !mountedRef.current) {
        console.log('❌ No mediaUrl provided for message:', messageId);
        if (mountedRef.current) {
          setHasError(true);
          setErrorDetails({ type: 'no_url', message: 'No image URL provided' });
          setIsLoading(false);
        }
        return;
      }

      // Prevent re-processing the same URL
      if (processedRef.current && imageUrl) {
        return;
      }

      // Check cache first
      const cacheKey = `${mediaUrl}-${messageId}`;
      if (urlCache.has(cacheKey)) {
        const cachedResult = urlCache.get(cacheKey);
        if (mountedRef.current) {
          setImageUrl(cachedResult.url);
          setHasError(cachedResult.hasError);
          setErrorDetails(cachedResult.errorDetails);
          setIsLoading(false);
          processedRef.current = true;
        }
        return;
      }

      if (mountedRef.current) {
        setIsLoading(true);
        setHasError(false);
        setErrorDetails(null);
      }

      console.log('🖼️ Processing image URL for message:', messageId, 'URLL:', mediaUrl);

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
          const errorInfo = {
            type: 'upload_failed',
            message: 'Upload process failed - local file URL found in database',
            originalUrl: mediaUrl,
            recommendation: 'The image was not properly uploaded to Supabase storage'
          };
          
          // Cache the error result
          urlCache.set(cacheKey, {
            url: null,
            hasError: true,
            errorDetails: errorInfo
          });
          
          if (mountedRef.current) {
            setHasError(true);
            setErrorDetails(errorInfo);
            setIsLoading(false);
          }
          return;
        }
        // Step 3: Handle relative paths by generating public URLs
        else {
          console.log('🔄 Generating public URL for file path:', mediaUrl);
          const { data: publicData } = supabase.storage
            .from('media')
            .getPublicUrl(mediaUrl);
          
          if (publicData?.publicUrl) {
            console.log('🔗 Generated public URL:', publicData.publicUrl);
            processedUrl = publicData.publicUrl;
          }
        }

        if (processedUrl && mountedRef.current) {
          // Simplified URL validation - just check if it's a proper URL format
          // Skip the intensive accessibility test that causes race conditions
          try {
            new URL(processedUrl); // This will throw if URL is malformed
            
            // Quick accessibility test without HEAD request that can cause issues
            const isValidSupabaseUrl = processedUrl.includes('/storage/v1/object/public/media/');
            
            if (isValidSupabaseUrl) {
              // Cache successful result
              urlCache.set(cacheKey, {
                url: processedUrl,
                hasError: false,
                errorDetails: null
              });
              
              // Periodic cache cleanup
              cacheAddCount++;
              if (cacheAddCount % 100 === 0) {
                cleanupCache();
              }
              
              setImageUrl(processedUrl);
              processedRef.current = true;
              console.log('✅ URL verified and set for message:', messageId);
            } else {
              throw new Error('Invalid Supabase storage URL format');
            }
          } catch (urlError) {
            console.error('❌ Invalid URL format:', urlError);
            const errorInfo = {
              type: 'invalid_url',
              message: 'Invalid URL format',
              url: processedUrl
            };
            
            // Cache error result
            urlCache.set(cacheKey, {
              url: null,
              hasError: true,
              errorDetails: errorInfo
            });
            
            setHasError(true);
            setErrorDetails(errorInfo);
          }
        } else {
          const errorInfo = {
            type: 'url_processing_failed',
            message: 'Failed to process image URL',
            originalUrl: mediaUrl
          };
          
          // Cache error result
          urlCache.set(cacheKey, {
            url: null,
            hasError: true,
            errorDetails: errorInfo
          });
          
          if (mountedRef.current) {
            setHasError(true);
            setErrorDetails(errorInfo);
          }
        }
      } catch (error) {
        console.error('❌ Error processing image URL:', error);
        const errorInfo = {
          type: 'processing_error',
          message: error.message,
          originalUrl: mediaUrl
        };
        
        // Cache error result
        urlCache.set(cacheKey, {
          url: null,
          hasError: true,
          errorDetails: errorInfo
        });
        
        if (mountedRef.current) {
          setHasError(true);
          setErrorDetails(errorInfo);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    processImageUrl();
  }, [mediaUrl, messageId, retryCount]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully for message:', messageId);
    if (mountedRef.current) {
      setIsLoading(false);
      setHasError(false);
    }
    if (onLoad) onLoad();
  };

  const handleImageError = (error) => {
    if (!mountedRef.current) return;
    
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
    
    const errorInfo = {
      type: errorType,
      message: errorMessage,
      nativeError: error.nativeEvent,
      currentUrl: imageUrl,
      originalUrl: mediaUrl
    };
    
    // Update cache with error info
    const cacheKey = `${mediaUrl}-${messageId}`;
    urlCache.set(cacheKey, {
      url: imageUrl,
      hasError: true,
      errorDetails: errorInfo
    });
    
    setIsLoading(false);
    setHasError(true);
    setErrorDetails(errorInfo);
    
    if (onError) onError(error);
  };

  const handleRetry = () => {
    if (!mountedRef.current) return;
    
    console.log('🔄 Retrying image load for message:', messageId);
    
    // Clear cache for this item to force reprocessing
    const cacheKey = `${mediaUrl}-${messageId}`;
    urlCache.delete(cacheKey);
    processedRef.current = false;
    
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
    if (fallbackComponent) {
      return (
        <View style={style}>
          {fallbackComponent}
          {children}
        </View>
      );
    }
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