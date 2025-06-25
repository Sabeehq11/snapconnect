import { runCleanupDiagnostics, markBadMessagesAsUnavailable } from './cleanupBadUrls';

export const runFullCleanup = async () => {
  console.log('🧹 Starting full cleanup process...');
  console.log('=====================================');

  try {
    // Step 1: Run diagnostics to see current state
    console.log('📊 Step 1: Running diagnostics...');
    const diagnostics = await runCleanupDiagnostics();
    
    if (diagnostics.totalIssues === 0) {
      console.log('✅ No cleanup needed - all URLs are properly formatted!');
      return { success: true, message: 'No cleanup needed', diagnostics };
    }

    console.log(`🚨 Found ${diagnostics.totalIssues} items needing cleanup`);

    // Step 2: Clean up bad message URLs
    if (diagnostics.messages?.bad > 0) {
      console.log('🔧 Step 2: Cleaning up bad message URLs...');
      const cleanupResult = await markBadMessagesAsUnavailable();
      console.log(`✅ Updated ${cleanupResult.updated || 0} messages`);
    }

    // Step 3: Run diagnostics again to confirm cleanup
    console.log('📊 Step 3: Running post-cleanup diagnostics...');
    const postCleanupDiagnostics = await runCleanupDiagnostics();

    console.log('🎉 CLEANUP COMPLETE!');
    console.log('=====================================');
    console.log(`📱 Messages: ${postCleanupDiagnostics.messages?.bad || 0} bad remaining`);
    console.log(`📖 Stories: ${postCleanupDiagnostics.stories?.bad || 0} bad remaining`);

    return {
      success: true,
      message: 'Cleanup completed successfully',
      before: diagnostics,
      after: postCleanupDiagnostics,
      itemsFixed: diagnostics.totalIssues - (postCleanupDiagnostics.totalIssues || 0)
    };

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return {
      success: false,
      message: `Cleanup failed: ${error.message}`,
      error: error.message
    };
  }
};

// Auto-run cleanup when this file is imported (for immediate execution)
export const runCleanupNow = () => {
  console.log('🚀 Auto-running cleanup...');
  runFullCleanup().then(result => {
    if (result.success) {
      console.log('✅ Auto-cleanup completed:', result.message);
      if (result.itemsFixed > 0) {
        console.log(`🔧 Fixed ${result.itemsFixed} items`);
      }
    } else {
      console.error('❌ Auto-cleanup failed:', result.message);
    }
  });
}; 