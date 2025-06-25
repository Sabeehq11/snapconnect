import { supabase } from '../../lib/supabase';

/**
 * FormData-based uploader - should work better with React Native + Supabase
 */
export const formDataUploadImage = async (uri, userId, filePrefix = 'snap') => {
  try {
    console.log('📤 FormData upload starting for:', uri);
    
    // Basic validation
    if (!uri || !userId) {
      throw new Error('Missing required parameters');
    }
    
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      throw new Error('Invalid URI format');
    }
    
    // Generate file info
    const timestamp = Date.now();
    const fileName = `${filePrefix}_${timestamp}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('📁 FormData upload path:', filePath);
    
    // Create FormData - this is the key difference
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: fileName,
    });
    
    console.log('📦 FormData created with file info');
    
    // Get upload URL from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }
    
    const supabaseUrl = supabase.supabaseUrl;
    const supabaseKey = supabase.supabaseKey;
    
    // Upload using fetch with FormData
    const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${filePath}`;
    
    console.log('⬆️ Starting FormData upload to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FormData upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ FormData upload successful:', result);
    
    // Get public URL
    const { data: publicData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    console.log('🔗 FormData public URL:', publicData.publicUrl);
    
    return {
      success: true,
      publicUrl: publicData.publicUrl,
      filePath,
      fileName,
    };
    
  } catch (error) {
    console.error('❌ FormData upload failed:', error);
    return {
      success: false,
      error: error.message,
      originalUri: uri
    };
  }
};

export const formDataUploadMessageImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'gallery' : 'snap';
  return await formDataUploadImage(uri, userId, prefix);
};

export const formDataUploadStoryImage = async (uri, userId, isFromGallery = false) => {
  const prefix = isFromGallery ? 'story_gallery' : 'story';
  return await formDataUploadImage(uri, userId, prefix);
}; 