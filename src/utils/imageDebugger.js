import { supabase } from '../../lib/supabase';

export const imageDebugger = {
  // Test if a URL is accessible with detailed diagnostics
  async testUrlAccessibility(url, messageId = 'unknown') {
    if (!url) {
      return {
        accessible: false,
        error: 'No URL provided',
        status: null,
        messageId
      };
    }

    try {
      console.log('🔍 URL test for message', messageId, '- Testing:', url);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'Accept': 'image/*',
        }
      });

      const result = {
        accessible: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        messageId,
        url
      };

      if (response.ok) {
        console.log('✅ URL is accessible for message', messageId, '- Status:', response.status);
        result.error = null;
      } else {
        const errorMessage = this.getErrorMessage(response.status);
        console.warn('⚠️ URL not accessible for message', messageId, '- Status:', response.status);
        result.error = errorMessage;
      }

      return result;
    } catch (error) {
      console.error('❌ URL test failed for message', messageId, '- Error:', error.message);
      
      return {
        accessible: false,
        error: error.message,
        status: null,
        messageId,
        url,
        networkError: true
      };
    }
  },

  // Get human-readable error message based on status code
  getErrorMessage(status) {
    switch (status) {
      case 400:
        return 'Bad request - URL format invalid';
      case 401:
        return 'Unauthorized - authentication required';
      case 403:
        return 'Access forbidden - check Supabase storage policies';
      case 404:
        return 'File not found - check if file exists in storage';
      case 500:
        return 'Server error - try again later';
      case 503:
        return 'Service unavailable - try again later';
      default:
        return `HTTP ${status} - Request failed`;
    }
  },

  // Test Supabase storage connection
  async testSupabaseStorage() {
    try {
      const { data, error } = await supabase.storage.from('media').list('', { limit: 1 });
      
      if (error) {
        return {
          success: false,
          error: error.message,
          details: 'Failed to connect to Supabase storage'
        };
      }

      return {
        success: true,
        data,
        details: `Connected successfully - found ${data.length} items in root`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Network error connecting to Supabase'
      };
    }
  },

  // Test public URL generation
  async testPublicUrlGeneration(filePath = 'test-user/snap_123456.jpg') {
    try {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        return {
          success: false,
          error: 'No public URL generated',
          details: 'Supabase did not return a public URL'
        };
      }

      // Validate URL format
      const expectedFormat = '/storage/v1/object/public/media/';
      const hasCorrectFormat = data.publicUrl.includes(expectedFormat);

      return {
        success: true,
        publicUrl: data.publicUrl,
        hasCorrectFormat,
        details: hasCorrectFormat 
          ? 'URL generated with correct format'
          : 'URL generated but format may be incorrect'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Error generating public URL'
      };
    }
  },

  // Comprehensive diagnostic suite
  async runDiagnostics() {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    console.log('🔧 Running image diagnostics suite...');

    // Test 1: Supabase Storage Connection
    console.log('🔍 Testing Supabase storage connection...');
    results.tests.storageConnection = await this.testSupabaseStorage();

    // Test 2: Public URL Generation
    console.log('🔍 Testing public URL generation...');
    results.tests.urlGeneration = await this.testPublicUrlGeneration();

    // Test 3: URL Accessibility (if URL generation succeeded)
    if (results.tests.urlGeneration.success) {
      console.log('🔍 Testing URL accessibility...');
      results.tests.urlAccessibility = await this.testUrlAccessibility(
        results.tests.urlGeneration.publicUrl,
        'diagnostic-test'
      );
    }

    // Test 4: Storage Policies (indirect test)
    console.log('🔍 Testing storage policies...');
    results.tests.storagePolicies = await this.testStoragePolicies();

    console.log('✅ Diagnostics complete:', results);
    return results;
  },

  // Test storage policies by attempting to list files
  async testStoragePolicies() {
    try {
      // Try to list files in the media bucket
      const { data, error } = await supabase.storage.from('media').list('', { limit: 5 });
      
      if (error) {
        return {
          success: false,
          error: error.message,
          details: 'Storage policies may be blocking access',
          recommendation: 'Check RLS policies on storage.objects table'
        };
      }

      return {
        success: true,
        details: `Policies allow listing - found ${data.length} items`,
        itemCount: data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Error testing storage policies'
      };
    }
  },

  // Validate and fix media URL
  async validateAndFixUrl(mediaUrl, userId) {
    if (!mediaUrl) {
      return { success: false, error: 'No URL provided' };
    }

    // If it's already a valid HTTP URL, test it
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      const test = await this.testUrlAccessibility(mediaUrl);
      return {
        success: test.accessible,
        url: mediaUrl,
        error: test.error,
        wasFixed: false
      };
    }

    // If it's a local file URL, we can't fix it here
    if (mediaUrl.startsWith('file://')) {
      return {
        success: false,
        error: 'Local file URL detected - file should be uploaded to Supabase storage',
        originalUrl: mediaUrl,
        recommendation: 'Upload file to Supabase storage before saving message'
      };
    }

    // Try to generate public URL for path
    try {
      const { data } = supabase.storage.from('media').getPublicUrl(mediaUrl);
      
      if (data.publicUrl) {
        const test = await this.testUrlAccessibility(data.publicUrl);
        return {
          success: test.accessible,
          url: data.publicUrl,
          error: test.error,
          wasFixed: true,
          originalUrl: mediaUrl
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalUrl: mediaUrl
      };
    }

    return {
      success: false,
      error: 'Could not process URL',
      originalUrl: mediaUrl
    };
  },

  // Log structured diagnostic information
  logDiagnostic(level, category, message, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      ...details
    };

    switch (level) {
      case 'error':
        console.error(`❌ [${category}] ${message}`, details);
        break;
      case 'warn':
        console.warn(`⚠️ [${category}] ${message}`, details);
        break;
      case 'info':
        console.log(`ℹ️ [${category}] ${message}`, details);
        break;
      case 'success':
        console.log(`✅ [${category}] ${message}`, details);
        break;
      default:
        console.log(`🔍 [${category}] ${message}`, details);
    }

    return logEntry;
  }
}; 