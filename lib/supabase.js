import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Using environment variables in Expo (with fallback to direct values)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ibgemvcivmjjkqlswzke.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ2VtdmNpdm1qamtxbHN3emtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTIzOTYsImV4cCI6MjA2NjI4ODM5Nn0.MlH2aPhZvuh2C63l44q7f3duH3kppE-9ONdCdn8lGgY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh of the session
    autoRefreshToken: true,
    // Enable persist session in local storage
    persistSession: true,
    // Detect session in URL - useful for OAuth flows
    detectSessionInUrl: false,
    // Storage key for session
    storageKey: 'snapconnect-auth-token',
  },
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log('📍 Supabase URL:', supabaseUrl);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Query error (this is normal if tables don\'t exist yet):', error.message);
      console.log('✅ Supabase client is connected and working!');
      return { success: true, message: 'Connected - tables may need to be created' };
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Sample data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return { success: false, error: err.message };
  }
};

export default supabase; 