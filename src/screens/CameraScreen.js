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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../utils/colors';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const [facing, setFacing] = useState('front'); // Default to front camera for selfies
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [currentFilter, setCurrentFilter] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef(null);
  const captureAnimation = useRef(new Animated.Value(1)).current;

  // AR Filter effects (simulated with overlay styles)
  const filters = [
    { name: 'None', style: {} },
    { name: 'Vintage', style: { tintColor: 'sepia(100%)', opacity: 0.8 } },
    { name: 'Cool', style: { tintColor: colors.lightPurple, opacity: 0.3 } },
    { name: 'Warm', style: { tintColor: colors.pink, opacity: 0.2 } },
    { name: 'Dreamy', style: { tintColor: colors.yellow, opacity: 0.15 } },
  ];

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

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            📸 Camera access needed for SnapConnect magic! ✨
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const animateCapture = () => {
    Animated.sequence([
      Animated.timing(captureAnimation, {
        toValue: 0.8,
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

        // Save to media library
        if (mediaPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          
          // Show success feedback
          Alert.alert(
            '📸 Snap Captured!', 
            'Your snap has been saved! Ready to share?',
            [
              { text: 'Take Another', style: 'cancel' },
              { 
                text: 'Share in Chat', 
                onPress: () => navigation.navigate('Chat'),
                style: 'default'
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('😅 Oops!', 'Failed to capture snap. Try again!');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: '1080p',
          maxDuration: 10, // 10 second limit like Snapchat
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

  const cycleFilter = () => {
    setCurrentFilter((prev) => (prev + 1) % filters.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Filter Overlay */}
        {currentFilter > 0 && (
          <View 
            style={[
              styles.filterOverlay, 
              { backgroundColor: filters[currentFilter].style.tintColor },
              { opacity: filters[currentFilter].style.opacity || 0.3 }
            ]} 
          />
        )}

        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>📸 SnapConnect</Text>
            
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Side Controls */}
          <View style={styles.sideControls}>
            <TouchableOpacity style={styles.filterButton} onPress={cycleFilter}>
              <Text style={styles.filterButtonText}>🎨</Text>
              <Text style={styles.filterName}>{filters[currentFilter].name}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton}>
              <Text style={styles.galleryButtonText}>🖼️</Text>
            </TouchableOpacity>
            
            <Animated.View style={{ transform: [{ scale: captureAnimation }] }}>
              <TouchableOpacity 
                style={[styles.captureButton, isRecording && styles.recordingButton]}
                onPress={takePicture}
                onLongPress={startRecording}
                onPressOut={stopRecording}
              >
                <LinearGradient
                  colors={isRecording ? [colors.error, colors.pink] : [colors.yellow, colors.brightYellow]}
                  style={styles.captureButtonInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isRecording && <View style={styles.recordingIndicator} />}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.chatButtonText}>💬</Text>
            </TouchableOpacity>
          </View>

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              Tap to snap • Hold for video • Swipe for filters
            </Text>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.yellow,
    textShadowColor: colors.blackOverlay,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 20,
  },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: '40%',
    alignItems: 'center',
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.blackOverlay,
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
  },
  filterButtonText: {
    fontSize: 24,
    marginBottom: 4,
  },
  filterName: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.yellow,
    elevation: 10,
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingButton: {
    borderColor: colors.error,
    shadowColor: colors.error,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 24,
  },
  recordingStatus: {
    position: 'absolute',
    top: 80,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginRight: 6,
  },
  recordingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: colors.white,
    fontSize: 12,
    backgroundColor: colors.blackOverlay,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.pink,
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
    elevation: 5,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CameraScreen; 