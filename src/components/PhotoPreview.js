import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Text,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { uploadStoryImage } from '../utils/imageUploader';

const { width, height } = Dimensions.get('window');

const PhotoPreview = ({ photoUri, onSendToFriends, onPostToStory, onCancel, isFromCamera = false }) => {
  const { user } = useAuth();
  const [isSavingToMemories, setIsSavingToMemories] = useState(false);

  const handleSaveToMemories = async () => {
    if (!user || !photoUri || isSavingToMemories) return;

    setIsSavingToMemories(true);
    
    try {
      // First, save to device gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need gallery access to save photos');
        setIsSavingToMemories(false);
        return;
      }

      // Save to device gallery
      const asset = await MediaLibrary.saveToLibraryAsync(photoUri);
      console.log('📸 Saved to device gallery:', asset);

      // Upload image to Supabase storage first
      console.log('📤 Uploading image to storage for memories...');
      const uploadResult = await uploadStoryImage(photoUri, user.id, 'memories');
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      console.log('✅ Image uploaded successfully:', uploadResult.publicUrl);

      // Save to memories database with the public URL
      const { data, error } = await supabase
        .from('memories')
        .insert([
          {
            user_id: user.id,
            media_url: uploadResult.publicUrl,
            media_type: 'image',
            caption: '',
            saved_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      Alert.alert(
        'Saved to Memories! 📸',
        'Your photo has been saved to memories and your device gallery.',
        [{ text: 'Great!' }]
      );

    } catch (error) {
      console.error('Error saving to memories:', error);
      Alert.alert(
        'Save Failed',
        'Could not save to memories. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSavingToMemories(false);
    }
  };

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
        
        {/* Save to Memories Button - Top Right (only for camera photos) */}
        {isFromCamera && (
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveToMemories}
            disabled={isSavingToMemories}
          >
            <LinearGradient
              colors={isSavingToMemories ? 
                ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)'] : 
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']
              }
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={isSavingToMemories ? "hourglass" : "bookmark"} 
                size={20} 
                color={colors.background} 
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
        
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
  saveButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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