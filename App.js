import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { testSupabaseConnection } from './lib/supabase';
import { startPeriodicCleanup } from './src/utils/disappearingMessagesCleanup';

export default function App() {
  useEffect(() => {
    // Test Supabase connection on app start
    testSupabaseConnection();
    
    // Start periodic cleanup for 24-hour disappearing messages
    const cleanupStop = startPeriodicCleanup();
    
    // Cleanup function
    return () => {
      cleanupStop();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#000" />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
