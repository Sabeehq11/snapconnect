import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testSupabaseConnection } from '../../lib/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [connectionResult, setConnectionResult] = useState(null);

  useEffect(() => {
    runConnectionTest();
  }, []);

  const runConnectionTest = async () => {
    setConnectionStatus('testing');
    try {
      const result = await testSupabaseConnection();
      setConnectionResult(result);
      setConnectionStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setConnectionResult({ success: false, error: error.message });
      setConnectionStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return '#FFA500';
      case 'success': return '#00FF00';
      case 'error': return '#FF0000';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄 Testing connection...';
      case 'success': return '✅ Supabase connected!';
      case 'error': return '❌ Connection failed';
      default: return '⚪ Unknown status';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={[styles.statusContainer, { borderColor: getStatusColor() }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {connectionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(connectionResult, null, 2)}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.testButton} onPress={runConnectionTest}>
        <Text style={styles.testButtonText}>Test Again</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.infoButton} 
        onPress={() => Alert.alert(
          'About this test',
          'This test verifies that:\n\n' +
          '✅ Supabase client is properly configured\n' +
          '✅ Network connection is working\n' +
          '✅ API keys are valid\n\n' +
          'Note: It\'s normal to see a "table not found" error if you haven\'t created the database tables yet.'
        )}
      >
        <Text style={styles.infoButtonText}>ℹ️ Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    padding: 15,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#FFFC00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default SupabaseTest; 