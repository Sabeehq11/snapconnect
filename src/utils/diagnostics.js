import { imageDebugger } from './imageDebugger';
import { supabase } from '../../lib/supabase';

export const runComprehensiveDiagnostics = async () => {
  console.log('🔧 Starting Comprehensive Image Diagnostics...');
  console.log('====================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: supabase.supabaseUrl,
      platform: 'React Native',
    },
    tests: {}
  };

  try {
    // 1. Basic System Info
    console.log('1️⃣ Checking System Information...');
    results.tests.systemInfo = {
      success: true,
      details: `Supabase URL: ${supabase.supabaseUrl}`,
      timestamp: new Date().toISOString()
    };

    // 2. Storage Connection Test
    console.log('2️⃣ Testing Supabase Storage Connection...');
    results.tests.storageConnection = await imageDebugger.testSupabaseStorage();

    // 3. URL Generation Test
    console.log('3️⃣ Testing Public URL Generation...');
    results.tests.urlGeneration = await imageDebugger.testPublicUrlGeneration();

    // 4. Storage Policies Test
    console.log('4️⃣ Testing Storage Policies...');
    results.tests.storagePolicies = await imageDebugger.testStoragePolicies();

    // 5. Full Diagnostic Suite
    console.log('5️⃣ Running Full Diagnostic Suite...');
    const fullResults = await imageDebugger.runDiagnostics();
    results.tests.fullSuite = fullResults.tests;

    // 6. Summary and Recommendations
    console.log('6️⃣ Generating Summary and Recommendations...');
    results.summary = generateSummary(results.tests);
    results.recommendations = generateRecommendations(results.tests);

    console.log('====================================================');
    console.log('📊 DIAGNOSTIC SUMMARY:');
    console.log('====================================================');
    
    Object.entries(results.summary).forEach(([test, status]) => {
      const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${test}: ${status}`);
    });

    if (results.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      console.log('====================================================');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('\n✅ Diagnostics Complete!');
    console.log('====================================================');

    return results;

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    results.error = error.message;
    return results;
  }
};

const generateSummary = (tests) => {
  const summary = {};
  
  // Check storage connection
  summary['Storage Connection'] = tests.storageConnection?.success ? 'success' : 'failed';
  
  // Check URL generation
  summary['URL Generation'] = tests.urlGeneration?.success ? 'success' : 'failed';
  
  // Check storage policies
  summary['Storage Policies'] = tests.storagePolicies?.success ? 'success' : 'failed';
  
  // Check overall health
  const allPassed = Object.values(summary).every(status => status === 'success');
  summary['Overall Health'] = allPassed ? 'success' : 'needs attention';
  
  return summary;
};

const generateRecommendations = (tests) => {
  const recommendations = [];
  
  // Storage connection issues
  if (!tests.storageConnection?.success) {
    recommendations.push('Check your Supabase project URL and API keys in the .env file');
    recommendations.push('Verify your internet connection and Supabase project status');
  }
  
  // URL generation issues
  if (!tests.urlGeneration?.success) {
    recommendations.push('Verify the "media" bucket exists in your Supabase Storage');
    recommendations.push('Check if the bucket is set to public in Supabase dashboard');
  }
  
  // Storage policy issues
  if (!tests.storagePolicies?.success) {
    recommendations.push('Run the provided SQL script to fix storage policies:');
    recommendations.push('COMPLETE_DATABASE_FIX.sql in your project root');
    recommendations.push('Ensure Row Level Security (RLS) is properly configured');
  }
  
  // URL accessibility issues
  if (tests.fullSuite?.urlAccessibility && !tests.fullSuite.urlAccessibility.accessible) {
    recommendations.push('Check CORS settings in your Supabase project');
    recommendations.push('Verify the storage bucket public access settings');
    recommendations.push('Test image URLs manually in a web browser');
  }
  
  // If everything looks good
  if (recommendations.length === 0) {
    recommendations.push('All systems appear to be working correctly!');
    recommendations.push('If you\'re still seeing black screens, check your image upload process');
    recommendations.push('Ensure you\'re storing proper HTTPS URLs in your database, not local file:// URLs');
  }
  
  return recommendations;
};

// Quick diagnostic function for development
export const quickDiagnostic = async () => {
  console.log('🚀 Quick Diagnostic Check...');
  
  try {
    const storageTest = await imageDebugger.testSupabaseStorage();
    const urlTest = await imageDebugger.testPublicUrlGeneration();
    
    console.log('Storage:', storageTest.success ? '✅' : '❌');
    console.log('URL Gen:', urlTest.success ? '✅' : '❌');
    
    if (storageTest.success && urlTest.success) {
      console.log('🎉 Basic systems are working!');
    } else {
      console.log('⚠️ Issues detected - run full diagnostics for details');
    }
    
    return { storage: storageTest.success, urlGeneration: urlTest.success };
  } catch (error) {
    console.error('❌ Quick diagnostic failed:', error);
    return { error: error.message };
  }
};

// Helper to test a specific image URL
export const testImageUrl = async (url, messageId = 'test') => {
  console.log(`🔍 Testing image URL: ${url}`);
  
  try {
    const result = await imageDebugger.testUrlAccessibility(url, messageId);
    
    if (result.accessible) {
      console.log('✅ URL is accessible');
    } else {
      console.log(`❌ URL not accessible: ${result.error}`);
      console.log(`Status: ${result.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ URL test failed:', error);
    return { accessible: false, error: error.message };
  }
}; 