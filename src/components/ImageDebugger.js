import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors } from '../utils/colors';

const ImageDebugger = () => {
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toISOString() }]);
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.storage.from('media').list('', { limit: 1 });
      if (error) {
        addResult('Supabase Connection', '❌ Failed', error.message);
      } else {
        addResult('Supabase Connection', '✅ Success', `Found ${data.length} items`);
      }
    } catch (error) {
      addResult('Supabase Connection', '❌ Error', error.message);
    }
  };

  const testPublicUrlGeneration = async () => {
    try {
      // Test with a dummy file path
      const testPath = 'test-user/snap_123456.jpg';
      const { data } = supabase.storage.from('media').getPublicUrl(testPath);
      
      addResult('Public URL Generation', '✅ Success', data.publicUrl);
      
      // Test if the URL format is correct
      if (data.publicUrl.includes('/storage/v1/object/public/media/')) {
        addResult('URL Format Check', '✅ Correct', 'URL follows expected format');
      } else {
        addResult('URL Format Check', '⚠️ Warning', 'URL format might be incorrect');
      }
    } catch (error) {
      addResult('Public URL Generation', '❌ Error', error.message);
    }
  };

  const testImageComponent = () => {
    // Test with a known working image URL
    const testUrl = 'https://via.placeholder.com/150x150.png?text=Test';
    addResult('Image Component Test', '🔄 Testing', `Loading: ${testUrl}`);
    
    return (
      <Image
        source={{ uri: testUrl }}
        style={{ width: 50, height: 50, margin: 10 }}
        onLoad={() => addResult('Image Component', '✅ Success', 'Test image loaded')}
        onError={(error) => addResult('Image Component', '❌ Failed', JSON.stringify(error))}
      />
    );
  };

  const testRealImageUrl = async () => {
    // Test with an actual image URL from your Supabase project
    const testUrl = 'https://your-project.supabase.co/storage/v1/object/public/media/test-image.jpg';
    const modifiedUrl = testUrl.replace('your-project', supabase.supabaseUrl.split('//')[1].split('.')[0]);
    
    addResult('Real Image URL Test', '🔄 Testing', `Testing: ${modifiedUrl}`);
    
    try {
      const response = await fetch(modifiedUrl, { method: 'HEAD' });
      if (response.ok) {
        addResult('Real Image URL Test', '✅ Success', `Status: ${response.status}`);
      } else {
        addResult('Real Image URL Test', '⚠️ Failed', `Status: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      addResult('Real Image URL Test', '❌ Error', error.message);
    }
  };

  const testStoragePolicies = async () => {
    try {
      // Test listing files in media bucket
      const { data, error } = await supabase.storage.from('media').list('', { limit: 3 });
      
      if (error) {
        addResult('Storage Policies', '❌ Failed', `Cannot list files: ${error.message}`);
        return;
      }
      
      addResult('Storage Policies', '✅ Success', `Can list files - found ${data.length} items`);
      
      // If we have files, test accessing one
      if (data.length > 0) {
        const testFile = data[0];
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(testFile.name);
        
        try {
          const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
          addResult('File Access Test', response.ok ? '✅ Success' : '⚠️ Warning', 
            `File "${testFile.name}" - Status: ${response.status}`);
        } catch (error) {
          addResult('File Access Test', '❌ Error', `Cannot access file: ${error.message}`);
        }
      }
    } catch (error) {
      addResult('Storage Policies', '❌ Error', error.message);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('Test Suite', '🔄 Starting', 'Running all diagnostic tests...');
    
    // Run tests sequentially for better readability
    await testSupabaseConnection();
    await testPublicUrlGeneration();
    await testStoragePolicies();
    await testRealImageUrl();
    
    addResult('Test Suite', '✅ Complete', 'All diagnostic tests finished');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Debug Tool</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={runAllTests}>
          <Text style={styles.buttonText}>Run Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      {testImageComponent()}
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTest}>{result.test}:</Text>
            <Text style={styles.resultStatus}>{result.result}</Text>
            {result.details && <Text style={styles.resultDetails}>{result.details}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  resultTest: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resultStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default ImageDebugger; 