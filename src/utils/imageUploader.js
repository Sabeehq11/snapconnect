import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Clean, simple image uploader for React Native/Expo
 * Uses FormData approach which is more reliable than blob manipulation
 */
export class ImageUploader {
  /**
   * Upload an image file to Supabase storage
   * @param {string} uri - File URI from ImagePicker or Camera
   * @param {string} userId - User ID for organizing files
   * @param {string} bucket - Storage bucket ('media' by default)
   * @param {string} folder - Folder within bucket ('chats' or 'stories')
   * @returns {Promise<{success: boolean, publicUrl?: string, error?: string}>}
   */
  static async uploadImage(uri, userId, bucket = 'media', folder = 'chats') {
    try {
      console.log('🚀 Starting image upload:', { uri, userId, bucket, folder });

      // Validate inputs
      if (!uri) {
        throw new Error('No image URI provided');
      }
      if (!userId) {
        throw new Error('No user ID provided');
      }

      // Check if file exists and get info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📄 File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('File does not exist at provided URI');
      }

      if (fileInfo.size === 0) {
        throw new Error('File is empty (0 bytes)');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${folder}_${timestamp}_${randomId}.jpg`;
      const filePath = `${userId}/${fileName}`;

      console.log('📁 Upload path:', filePath);

      // Use FormData approach - more reliable for React Native
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: fileName,
      });

      // Upload using Supabase client with FormData
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, formData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw error;
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      const publicUrl = publicUrlData.publicUrl;
      console.log('🔗 Public URL:', publicUrl);

      // Verify upload by checking file exists in storage
      const { data: fileList } = await supabase.storage
        .from(bucket)
        .list(userId);

      const uploadedFile = fileList?.find(file => file.name === fileName);
      if (!uploadedFile) {
        console.warn('⚠️ Upload may have failed - file not found in storage list');
      } else {
        console.log('✅ Upload verified:', uploadedFile);
      }

      return {
        success: true,
        publicUrl,
        filePath,
        fileName,
        fileSize: fileInfo.size
      };

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown upload error'
      };
    }
  }

  /**
   * Upload image for chat messages
   */
  static async uploadChatImage(uri, userId) {
    return await ImageUploader.uploadImage(uri, userId, 'media', 'chats');
  }

  /**
   * Upload image for stories
   */
  static async uploadStoryImage(uri, userId) {
    return await ImageUploader.uploadImage(uri, userId, 'media', 'stories');
  }
}

// Export convenience functions for backward compatibility
export const uploadChatImage = ImageUploader.uploadChatImage;
export const uploadStoryImage = ImageUploader.uploadStoryImage; 