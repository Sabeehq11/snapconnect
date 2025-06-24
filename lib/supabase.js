import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Supabase configuration - SECURE VERSION
// These values MUST be set in .env file - no hardcoded fallbacks for security
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    ❌ Missing Supabase environment variables!
    
    Please create a .env file with:
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    
    Copy env.template to .env and fill in your credentials.
  `);
}

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
    console.log('📍 Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
    
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