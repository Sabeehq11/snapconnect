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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import PhotoPreview from '../components/PhotoPreview';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useStories } from '../hooks/useStories';
import { uploadStoryImage } from '../utils/imageUploader';
import { simpleUploadStoryImage } from '../utils/simpleUploader';
import { directUploadStoryImage } from '../utils/directUploader';

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const cameraRef = useRef(null);
  const captureAnimation = useRef(new Animated.Value(1)).current;
  const recordingAnimation = useRef(new Animated.Value(1)).current;

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
    if (cameraRef.current) {
      try {
        animateCapture();
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
          skipProcessing: false,
        });

        // Save to library if permission granted
        if (mediaPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
        }

        // Show photo preview
        setCapturedPhoto(photo.uri);
        setShowPhotoPreview(true);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('😅 Oops!', 'Failed to capture snap. Try again!');
      }
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to access your photos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
        selectionLimit: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setShowImagePreview(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Remove this function as options are now handled in PhotoPreview

  const handleSendToFriends = () => {
    const photoUri = capturedPhoto || selectedImage;
    const isFromGallery = !!selectedImage;
    const { chatId, chatName } = route.params || {};
    
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    setCapturedPhoto(null);
    setSelectedImage(null);
    
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
    
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    
    try {
      console.log('📖 Trying direct story uploader first...');
      
      // Try direct uploader first
      const directResult = await directUploadStoryImage(photoUri, user.id, isFromGallery);
      
      if (directResult.success) {
        console.log('✅ Direct story upload succeeded:', directResult);
        
        await createStory(
          directResult.publicUrl,
          'image',
          isFromGallery ? 'Posted from gallery' : 'New story'
        );

        console.log('🎉 Story posted successfully!');
        Alert.alert('📖 Story Posted!', 'Your story is now live for 24 hours!');
        setCapturedPhoto(null);
        setSelectedImage(null);
        return;
      }
      
      console.warn('⚠️ Direct story uploader failed, trying simple uploader...', directResult.error);
      
      // Fallback to simple uploader
      const simpleResult = await simpleUploadStoryImage(photoUri, user.id, isFromGallery);
      
      if (simpleResult.success) {
        console.log('✅ Simple story upload succeeded:', simpleResult);
        
        await createStory(
          simpleResult.publicUrl,
          'image',
          isFromGallery ? 'Posted from gallery' : 'New story'
        );

        console.log('🎉 Story posted successfully!');
        Alert.alert('📖 Story Posted!', 'Your story is now live for 24 hours!');
        setCapturedPhoto(null);
        setSelectedImage(null);
        return;
      }
      
      console.warn('⚠️ Simple story uploader failed, trying robust uploader...', simpleResult.error);
      
      // Last resort: robust uploader
      const robustResult = await uploadStoryImage(photoUri, user.id, isFromGallery);
      
      if (!robustResult.success) {
        throw new Error(`All story uploaders failed. Direct: ${directResult.error}, Simple: ${simpleResult.error}, Robust: ${robustResult.error}`);
      }
      
      console.log('✅ Robust story upload completed:', robustResult);

      // Create story using the hook with the validated URL
      await createStory(
        robustResult.publicUrl,
        'image',
        isFromGallery ? 'Posted from gallery' : 'New story'
      );

      console.log('🎉 Story posted successfully!');
      Alert.alert('📖 Story Posted!', 'Your story is now live for 24 hours!');
      setCapturedPhoto(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('❌ Error posting story:', error);
      console.error('❌ Story context:', { photoUri, userId: user.id, isFromGallery });
      Alert.alert('Error', `Failed to post story: ${error.message}`);
    }
  };

  const handleCancelPhoto = () => {
    setShowPhotoPreview(false);
    setShowImagePreview(false);
    setCapturedPhoto(null);
    setSelectedImage(null);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? 'on' : 'off'}
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
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
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
          />
        )}
      </Modal>


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