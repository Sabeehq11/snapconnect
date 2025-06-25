import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Direct file upload using Expo FileSystem - most reliable for React Native
 */
export const directUploadImage = async (uri, userId, filePrefix = 'snap') => {
  try {
    console.log('🎯 Direct upload starting for:', uri);
    
    // Basic validation
    if (!uri || !userId) {
      throw new Error('Missing required parameters');
    }
    
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      throw new Error('Invalid URI format');
    }
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    console.log('📄 File info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    if (fileInfo.size === 0) {
      throw new Error('File is empty (0 bytes)');
    }
    
    // Generate file path
    const timestamp = Date.now();
    const fileName = `${filePrefix}_${timestamp}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('📁 Direct upload path:', filePath);
    
    // Method 1: Try reading file as base64 and uploading
    try {
      console.log('📖 Reading file as base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📦 Base64 length:', base64.length);
      
      if (!base64 || base64.length === 0) {
        throw new Error('Failed to read file as base64');
      }
      
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      console.log('📦 Blob from base64 - Size:', blob.size, 'Type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Blob created from base64 is empty');
      }
      
      // Upload the blob
      console.log('⬆️ Uploading blob to Supabase...');
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw error;
      }
      
      console.log('✅ Direct upload successful:', data);
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      if (!publicData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      console.log('🔗 Direct public URL:', publicData.publicUrl);
      
      // Quick verification - check if file exists in storage
      const { data: listData } = await supabase.storage
        .from('media')
        .list(userId);
      
      const uploadedFile = listData?.find(file => file.name === fileName);
      if (uploadedFile) {
        console.log('✅ File verified in storage:', uploadedFile);
        if (uploadedFile.metadata?.size === 0) {
          console.warn('⚠️ File uploaded but shows as 0 bytes in metadata');
        }
      }
      
      return {
        success: true,
        publicUrl: publicData.publicUrl,
        filePath,
        fileName,
        fileSize: blob.size,
        uploadedFileInfo: uploadedFile
      };
      
    } catch (base64Error) {
      console.error('❌ Base64 method failed:', base64Error);
      throw base64Error;
    }
    
  } catch (error) {
    console.error('❌ Direct upload failed:', error);
    return {
      success: false,
      error: error.message,
      originalUri: uri
    };
  }
};

export const directUploadMessageImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'gallery' : 'snap';
  return await directUploadImage(uri, userId, prefix);
};

export const directUploadStoryImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'story_gallery' : 'story';
  return await directUploadImage(uri, userId, prefix);
}; 