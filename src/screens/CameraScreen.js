import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  Image,
  Button,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import PhotoPreview from '../components/PhotoPreview';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useStories } from '../hooks/useStories';
import { uploadStoryImage } from '../utils/imageUploader';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import RAGStoryIdeas from '../components/RAGStoryIdeas';
import TabbedImagePicker from '../components/TabbedImagePicker';
import ARFilters, { FilterOverlay, applyImageFilter, applyImageFilterWithFallback } from '../components/ARFilters';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { createStory } = useStories();
  const [facing, setFacing] = useState('front');
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [originalCapturedPhoto, setOriginalCapturedPhoto] = useState(null); // Store original unfiltered photo
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalSelectedImage, setOriginalSelectedImage] = useState(null); // Store original unfiltered image
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showTabbedPicker, setShowTabbedPicker] = useState(false);
  const cameraRef = useRef(null);
  const captureAnimation = useRef(new Animated.Value(1)).current;
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  
  // RAG Features
  const [showStoryIdeas, setShowStoryIdeas] = useState(false);
  
  // AR Filters
  const [showARFilters, setShowARFilters] = useState(false);
  const [currentARFilter, setCurrentARFilter] = useState(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
    })();
  }, []);

  // Simplified camera initialization
  useEffect(() => {
    const initializeCamera = async () => {
      if (permission?.granted) {
        console.log('🎥 Camera permissions granted, initializing...');
        // Simple delay to allow camera to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('📱 Camera ready');
      }
    };

    initializeCamera();
  }, [permission?.granted]);

  // Reset modal state when returning to camera screen
  useFocusEffect(
    React.useCallback(() => {
      // Only clear modals if we have route params indicating we're returning from a send action
      if (route.params?.shouldClearModal) {
        console.log('🔄 Clearing modal state after returning from send action');
        setShowPhotoPreview(false);
        setShowImagePreview(false);
        setShowTabbedPicker(false);
        setCapturedPhoto(null);
        setSelectedImage(null);
        
        // Clear the param to prevent future unintended clears
        navigation.setParams({ shouldClearModal: undefined });
      }
    }, [route.params?.shouldClearModal])
  );

  useEffect(() => {
    if (isRecording) {
      // Animate recording indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordingAnimation.setValue(1);
    }
  }, [isRecording]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.black} />
        <LinearGradient
          colors={colors.gradients.snapGradient}
          style={styles.permissionContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.permissionContent}>
            <View style={styles.permissionCard}>
              <Ionicons name="camera" size={64} color={colors.primary} />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionText}>
                Enable camera access to capture and share amazing snaps!
              </Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.permissionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="camera" size={20} color={colors.white} />
                  <Text style={styles.permissionButtonText}>Enable Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const animateCapture = () => {
    Animated.sequence([
      Animated.timing(captureAnimation, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(captureAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'Camera not ready. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('📸 Attempting to take picture...');
      
      animateCapture();
      
      // Simplified camera options for better compatibility
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        exif: false,
      });

      console.log('✅ Picture taken successfully:', photo);

      if (!photo || !photo.uri) {
        throw new Error('No photo URI returned from camera');
      }

      // Basic file validation
      const fileInfo = await FileSystem.getInfoAsync(photo.uri);
      console.log('📄 Photo file info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('Photo file was not created');
      }

      if (fileInfo.size === 0) {
        throw new Error('Photo file is empty (0 bytes)');
      }

      // Store the original unfiltered photo
      setOriginalCapturedPhoto(photo.uri);
      
      // Apply selected filter if any
      let processedPhotoUri = photo.uri;
      if (currentARFilter && currentARFilter.id !== 'none') {
        console.log('🎨 Applying filter to captured photo:', currentARFilter.name);
        try {
          processedPhotoUri = await applyImageFilterWithFallback(photo.uri, currentARFilter.id, photo.uri);
          console.log('✅ Filter applied successfully to captured photo');
        } catch (filterError) {
          console.warn('⚠️ Filter application failed, using original photo:', filterError);
          processedPhotoUri = photo.uri; // Fallback to original
        }
      }

      // Save to library if permission granted (save the best version available)
      if (mediaPermission?.granted) {
        try {
          // Save the filtered version if available, otherwise save original
          const imageToSave = processedPhotoUri || photo.uri;
          await MediaLibrary.saveToLibraryAsync(imageToSave);
          console.log('✅ Photo saved to library');
        } catch (saveError) {
          console.warn('⚠️ Failed to save to library:', saveError);
          // Don't throw here - saving to library is optional
        }
      }

      // Show photo preview with processed image
      setCapturedPhoto(processedPhotoUri);
      setShowPhotoPreview(true);
      
    } catch (error) {
      console.error('❌ Error taking picture:', error);
      
      // Simplified error handling
      let errorMessage = 'Failed to capture photo. ';
      
      if (error.message?.includes('No photo URI returned')) {
        errorMessage = 'Camera failed to capture photo. Try switching cameras or restarting the app.';
      } else if (error.message?.includes('Photo file was not created')) {
        errorMessage = 'Photo could not be saved. Check device storage and try again.';
      } else if (error.message?.includes('Photo file is empty')) {
        errorMessage = 'Photo capture failed. Try again with better lighting.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      Alert.alert(
        'Camera Error', 
        errorMessage,
        [
          { text: 'OK' },
          { 
            text: 'Switch Camera', 
            onPress: () => toggleCameraFacing()
          }
        ]
      );
    }
  };

  const openImagePicker = () => {
    setShowTabbedPicker(true);
  };

  const handleImageSelect = async (imageUri) => {
    console.log('📷 Image selected from tabbed picker:', imageUri);
    
    // Store the original unfiltered image
    setOriginalSelectedImage(imageUri);
    
    // Apply selected filter if any
    let processedImageUri = imageUri;
    if (currentARFilter && currentARFilter.id !== 'none') {
      console.log('🎨 Applying filter to selected image:', currentARFilter.name);
      try {
        processedImageUri = await applyImageFilterWithFallback(imageUri, currentARFilter.id, imageUri);
        console.log('✅ Filter applied to gallery image successfully');
      } catch (filterError) {
        console.warn('⚠️ Filter application failed, using original image:', filterError);
        processedImageUri = imageUri; // Fallback to original
      }
    }
    
    setSelectedImage(processedImageUri);
    setShowImagePreview(true);
    setShowTabbedPicker(false);
  };

  // Remove this function as options are now handled in PhotoPreview

  const handleSendToFriends = () => {
    const photoUri = capturedPhoto || selectedImage;
    const isFromGallery = !!selectedImage;
    const { chatId, chatName } = route.params || {};
    
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    setShowTabbedPicker(false);
    setCapturedPhoto(null);
    setSelectedImage(null);
    // Clear original images
    setOriginalCapturedPhoto(null);
    setOriginalSelectedImage(null);
    
    navigation.navigate('SendToFriends', { 
      photoUri, 
      isFromGallery,
      previousScreen: 'Camera',
      chatId, // Pass the chat ID if available
      chatName // Pass the chat name if available
    });
  };

  const handlePostToStory = async () => {
    const photoUri = capturedPhoto || selectedImage;
    const isFromGallery = !!selectedImage;
    
    if (!photoUri || !user) {
      Alert.alert('Error', 'No photo to upload or user not authenticated');
      return;
    }
    
    console.log('📖 Navigating to Story Publish screen with image:', photoUri);
    
    // Close modals
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    setShowTabbedPicker(false);
    
    // Clear state
    setCapturedPhoto(null);
    setSelectedImage(null);
    // Clear original images
    setOriginalCapturedPhoto(null);
    setOriginalSelectedImage(null);
    
    // Navigate to StoryPublishScreen with image data
    navigation.navigate('StoryPublish', {
      imageUri: photoUri,
      imageInfo: {
        isFromGallery,
        width: width,
        height: height,
        source: isFromGallery ? 'gallery' : 'camera'
      }
    });
  };

  const handleCancelPhoto = () => {
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    setShowTabbedPicker(false);
    setCapturedPhoto(null);
    setSelectedImage(null);
    // Clear original images to free memory
    setOriginalCapturedPhoto(null);
    setOriginalSelectedImage(null);
  };



  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: '1080p',
          maxDuration: 10,
        });

        if (mediaPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(video.uri);
          Alert.alert('🎥 Video Snap Saved!', 'Your video snap is ready to share!');
        }
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('😅 Recording Failed', 'Try again!');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const handleLongPress = () => {
    startRecording();
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // RAG Handler Functions
  const handleSelectStoryIdea = (idea) => {
    console.log('✅ RAG: Selected story idea:', idea);
    Alert.alert(
      '💡 Story Idea Selected',
      `Great choice! "${idea.split(':')[0]}" - Now capture your story!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleOpenStoryIdeas = () => {
    console.log('🤖 RAG: Opening story ideas');
    setShowStoryIdeas(true);
  };

  const handleOpenARFilters = () => {
    console.log('✨ AR: Opening filters modal');
    setShowARFilters(true);
  };

  const handleARFilterSelect = async (filter) => {
    console.log('✨ AR: Selected filter:', filter);
    setCurrentARFilter(filter);
    
    // If we have images in preview, re-apply the new filter to the original images
    try {
      // Re-apply filter to captured photo if available
      if (originalCapturedPhoto && showPhotoPreview) {
        console.log('🔄 Re-applying filter to captured photo...');
        let newProcessedPhoto = originalCapturedPhoto;
        
        if (filter && filter.id !== 'none') {
          try {
            newProcessedPhoto = await applyImageFilterWithFallback(
              originalCapturedPhoto, 
              filter.id, 
              originalCapturedPhoto
            );
            console.log('✅ Filter re-applied to captured photo successfully');
          } catch (filterError) {
            console.warn('⚠️ Filter re-application failed for captured photo:', filterError);
            newProcessedPhoto = originalCapturedPhoto;
          }
        }
        
        setCapturedPhoto(newProcessedPhoto);
      }
      
      // Re-apply filter to selected image if available
      if (originalSelectedImage && showImagePreview) {
        console.log('🔄 Re-applying filter to selected image...');
        let newProcessedImage = originalSelectedImage;
        
        if (filter && filter.id !== 'none') {
          try {
            newProcessedImage = await applyImageFilterWithFallback(
              originalSelectedImage, 
              filter.id, 
              originalSelectedImage
            );
            console.log('✅ Filter re-applied to selected image successfully');
          } catch (filterError) {
            console.warn('⚠️ Filter re-application failed for selected image:', filterError);
            newProcessedImage = originalSelectedImage;
          }
        }
        
        setSelectedImage(newProcessedImage);
      }
    } catch (error) {
      console.error('❌ Error during filter re-application:', error);
      // Don't show alert here as it would interrupt the filter selection flow
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? 'on' : 'off'}
        mode="picture"
        videoQuality="1080p"
        pictureSize="1920x1080"
        onCameraReady={() => {
          console.log('🎥 Camera is ready');
        }}
        onMountError={(error) => {
          console.error('❌ Camera mount error:', error);
          Alert.alert(
            'Camera Error',
            'Camera failed to initialize. This is common on some iOS devices. Try switching cameras or restarting the app.',
            [
              { text: 'OK' },
              { 
                text: 'Switch Camera', 
                onPress: () => {
                  toggleCameraFacing();
                  setTimeout(() => {
                    Alert.alert('Camera Switched', 'Camera switched. Try again.');
                  }, 500);
                }
              },
              { text: 'Restart', onPress: () => navigation.replace('Camera') }
            ]
          );
        }}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={[styles.controlButton, flash && styles.flashActive]} 
            onPress={toggleFlash}
          >
            <Ionicons 
              name={flash ? "flash" : "flash-off"} 
              size={24} 
              color={flash ? colors.snapYellow : colors.white} 
            />
          </TouchableOpacity>
          
          {/* RAG Story Ideas Button */}
          <TouchableOpacity 
            style={styles.storyIdeasButton} 
            onPress={handleOpenStoryIdeas}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.storyIdeasGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bulb" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          {/* AR Filters Button */}
          <TouchableOpacity 
            style={[styles.arFiltersButton, currentARFilter && styles.arFiltersActive]} 
            onPress={handleOpenARFilters}
          >
            <LinearGradient
              colors={currentARFilter ? ['#E91E63', '#C2185B'] : ['#9C27B0', '#7B1FA2']}
              style={styles.arFiltersGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={currentARFilter ? "star" : "glasses-outline"} 
                size={18} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Side Controls */}
        <View style={styles.sideControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.galleryButton} onPress={openImagePicker}>
            <View style={styles.galleryPreview}>
              <Ionicons name="images" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>

          {/* Capture Button */}
          <Animated.View style={[styles.captureButtonContainer, { transform: [{ scale: captureAnimation }] }]}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              onLongPress={handleLongPress}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonOuter}>
                <Animated.View 
                  style={[
                    styles.captureButtonInner,
                    isRecording && { 
                      backgroundColor: colors.error,
                      transform: [{ scale: recordingAnimation }]
                    }
                  ]} 
                />
              </View>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>REC</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Chat Button */}
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.chatButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubbles" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AR Filter Overlay */}
        <FilterOverlay filter={currentARFilter} style={styles.filterOverlay} />
      </CameraView>

      {/* Photo Preview Modal */}
      <Modal
        visible={showPhotoPreview}
        animationType="slide"
        statusBarTranslucent
      >
        {capturedPhoto && (
          <PhotoPreview
            photoUri={capturedPhoto}
            onSendToFriends={handleSendToFriends}
            onPostToStory={handlePostToStory}
            onCancel={handleCancelPhoto}
            isFromCamera={true}
          />
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        animationType="slide"
        statusBarTranslucent
      >
        {selectedImage && (
          <PhotoPreview
            photoUri={selectedImage}
            onSendToFriends={handleSendToFriends}
            onPostToStory={handlePostToStory}
            onCancel={handleCancelPhoto}
            isFromCamera={false}
          />
        )}
      </Modal>

      {/* RAG Story Ideas Modal */}
      <RAGStoryIdeas
        visible={showStoryIdeas}
        onClose={() => setShowStoryIdeas(false)}
        onSelectIdea={handleSelectStoryIdea}
      />

      {/* Tabbed Image Picker Modal */}
      <TabbedImagePicker
        visible={showTabbedPicker}
        onClose={() => setShowTabbedPicker(false)}
        onSelectImage={handleImageSelect}
      />

      {/* AR Filters Modal */}
      <ARFilters
        isVisible={showARFilters}
        onClose={() => setShowARFilters(false)}
        onFilterSelect={handleARFilterSelect}
        currentFilter={currentARFilter?.id}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1F',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  flashActive: {
    backgroundColor: 'rgba(255, 252, 0, 0.2)',
    borderWidth: 2,
    borderColor: colors.snapYellow,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyIdeasButton: {
    borderRadius: 22,
  },
  storyIdeasGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arFiltersButton: {
    borderRadius: 22,
  },
  arFiltersActive: {
    transform: [{ scale: 1.1 }],
  },
  arFiltersGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  sideControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -22 }],
    zIndex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  galleryButton: {
    width: 50,
    height: 50,
  },
  galleryPreview: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 6,
  },
  recordingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

});

export default CameraScreen; 