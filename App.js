import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { testSupabaseConnection } from './lib/supabase';

export default function App() {
  useEffect(() => {
    // Test Supabase connection on app start
    testSupabaseConnection();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#000" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
