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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';

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
    { name: 'None', style: {}, icon: 'camera' },
    { name: 'Vintage', style: { backgroundColor: '#8B4513', opacity: 0.2 }, icon: 'color-palette' },
    { name: 'Cool', style: { backgroundColor: colors.accent, opacity: 0.15 }, icon: 'snow' },
    { name: 'Warm', style: { backgroundColor: colors.warning, opacity: 0.15 }, icon: 'sunny' },
    { name: 'Dreamy', style: { backgroundColor: colors.secondary, opacity: 0.1 }, icon: 'sparkles' },
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
        <LinearGradient
          colors={colors.gradients.hero}
          style={styles.permissionContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.permissionContent}>
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.permissionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="camera" size={64} color={colors.primary} style={styles.permissionIcon} />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionText}>
                Enable camera access to capture and share amazing snaps with your friends!
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
            </LinearGradient>
          </View>
        </LinearGradient>
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
              filters[currentFilter].style
            ]} 
          />
        )}

        <View style={styles.overlay}>
          {/* Top Controls with Gradient Header */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent']}
            style={styles.topGradient}
          >
            <View style={styles.topControls}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.goBack()}
              >
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.iconButtonBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
              
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.titleContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="camera" size={20} color={colors.white} />
                <Text style={styles.title}>SnapConnect</Text>
              </LinearGradient>
              
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.iconButtonBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera-reverse" size={24} color={colors.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Side Controls */}
          <View style={styles.sideControls}>
            <TouchableOpacity style={styles.filterButton} onPress={cycleFilter}>
              <LinearGradient
                colors={colors.gradients.secondary}
                style={styles.filterButtonBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={filters[currentFilter].icon} size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.filterName}>{filters[currentFilter].name}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Controls with Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bottomGradient}
          >
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.iconButton}>
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.iconButtonBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="images" size={24} color={colors.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
              
              <Animated.View style={{ transform: [{ scale: captureAnimation }] }}>
                <TouchableOpacity 
                  style={styles.captureButton}
                  onPress={takePicture}
                  onLongPress={startRecording}
                  onPressOut={stopRecording}
                >
                  <LinearGradient
                    colors={isRecording ? colors.gradients.accent : colors.gradients.primary}
                    style={styles.captureButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.captureButtonInner}>
                      {isRecording ? (
                        <View style={styles.recordingIndicator} />
                      ) : (
                        <Ionicons name="camera" size={32} color={colors.white} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Chat')}
              >
                <LinearGradient
                  colors={colors.gradients.card}
                  style={styles.iconButtonBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="chatbubbles" size={24} color={colors.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Recording Timer */}
            {isRecording && (
              <View style={styles.recordingInfo}>
                <LinearGradient
                  colors={colors.gradients.accent}
                  style={styles.recordingTimer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>Recording...</Text>
                </LinearGradient>
              </View>
            )}
          </LinearGradient>
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 350,
  },
  permissionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  permissionIcon: {
    marginBottom: theme.spacing.lg,
  },
  permissionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionText: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  permissionButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  permissionButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.white,
  },

  // Top Controls
  topGradient: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
    ...theme.shadows.glow,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.white,
  },

  // Icon Buttons
  iconButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  iconButtonBackground: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },

  // Side Controls
  sideControls: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: height * 0.3,
    alignItems: 'center',
  },
  filterButton: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  filterButtonBackground: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  filterName: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },

  // Bottom Controls
  bottomGradient: {
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
  },

  // Capture Button
  captureButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recording States
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  recordingInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  recordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.white,
  },

  // Filter Overlay
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
});

export default CameraScreen; 