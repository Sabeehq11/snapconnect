import { supabase } from '../../lib/supabase';

/**
 * Simple, reliable image uploader - fallback for when the robust uploader has issues
 */
export const simpleUploadImage = async (uri, userId, filePrefix = 'snap') => {
  try {
    console.log('🔄 Simple upload starting for:', uri);
    
    // Basic validation
    if (!uri || !userId) {
      throw new Error('Missing required parameters');
    }
    
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      throw new Error('Invalid URI format');
    }
    
    // Create blob using the most basic method
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('📦 Simple blob created:', { size: blob.size, type: blob.type });
    
    if (blob.size === 0) {
      throw new Error('Blob is empty');
    }
    
    // Generate file path
    const timestamp = Date.now();
    const fileName = `${filePrefix}_${timestamp}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('📁 Simple upload path:', filePath);
    
    // Upload with minimal options
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('❌ Simple upload error:', error);
      throw error;
    }
    
    console.log('✅ Simple upload successful:', data);
    
    // Get public URL
    const { data: publicData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    console.log('🔗 Simple public URL:', publicData.publicUrl);
    
    return {
      success: true,
      publicUrl: publicData.publicUrl,
      filePath,
      fileName,
      fileSize: blob.size
    };
    
  } catch (error) {
    console.error('❌ Simple upload failed:', error);
    return {
      success: false,
      error: error.message,
      originalUri: uri
    };
  }
};

export const simpleUploadMessageImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'gallery' : 'snap';
  return await simpleUploadImage(uri, userId, prefix);
};

export const simpleUploadStoryImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'story_gallery' : 'story';
  return await simpleUploadImage(uri, userId, prefix);
}; 