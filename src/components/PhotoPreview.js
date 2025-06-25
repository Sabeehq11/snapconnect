import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

const PhotoPreview = ({ photoUri, onSendToFriends, onPostToStory, onCancel }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      
      {/* Photo Display */}
      <Image source={{ uri: photoUri }} style={styles.photo} />
      
      {/* Action Buttons */}
      <SafeAreaView style={styles.actionContainer}>
        {/* Cancel Button - Top Left */}
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
        
        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onSendToFriends}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Send to Friends</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onPostToStory}>
            <LinearGradient
              colors={colors.gradients.accent}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="book" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Post to Story</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  photo: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 25,
    overflow: 'hidden',
    height: 50,
  },
  actionButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PhotoPreview; 