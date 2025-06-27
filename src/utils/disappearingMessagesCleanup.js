import { supabase } from '../../lib/supabase';

/**
 * Clean up messages that have expired after 24 hours
 * This function should be called periodically (e.g., when app starts, enters foreground)
 */
export const cleanup24HourMessages = async () => {
  try {
    console.log('🕐 Starting 24-hour message cleanup...');
    
    // Call the database function to mark expired messages as disappeared
    const { data, error } = await supabase.rpc('cleanup_expired_messages');
    
    if (error) {
      console.error('❌ Error during 24-hour cleanup:', error);
      return { success: false, error };
    }
    
    const expiredCount = data || 0;
    console.log(`✅ 24-hour cleanup completed. ${expiredCount} messages expired.`);
    
    return { success: true, expiredCount };
  } catch (error) {
    console.error('❌ Unexpected error during 24-hour cleanup:', error);
    return { success: false, error };
  }
};

/**
 * Auto-cleanup function that runs at app startup and periodically
 */
export const startPeriodicCleanup = () => {
  // Run cleanup immediately
  cleanup24HourMessages();
  
  // Set up periodic cleanup every 30 minutes
  const intervalId = setInterval(() => {
    cleanup24HourMessages();
  }, 30 * 60 * 1000); // 30 minutes
  
  console.log('🔄 Periodic 24-hour message cleanup started');
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Periodic 24-hour message cleanup stopped');
  };
};

/**
 * Check if a message has expired based on 24-hour rule
 */
export const isMessage24HourExpired = (message) => {
  if (!message || !message.created_at) return false;
  
  const messageDate = new Date(message.created_at);
  const now = new Date();
  const hoursAgo = (now - messageDate) / (1000 * 60 * 60);
  
  return hoursAgo >= 24;
};

/**
 * Get time remaining before a message expires (in hours)
 */
export const getTimeUntilExpiration = (message) => {
  if (!message || !message.created_at) return null;
  
  const messageDate = new Date(message.created_at);
  const now = new Date();
  const hoursAgo = (now - messageDate) / (1000 * 60 * 60);
  const hoursRemaining = 24 - hoursAgo;
  
  return Math.max(0, hoursRemaining);
}; 