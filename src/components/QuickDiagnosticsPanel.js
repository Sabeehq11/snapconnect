import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../utils/colors';
import { runComprehensiveDiagnostics } from '../utils/diagnostics';
import { runCleanupDiagnostics, markBadMessagesAsUnavailable } from '../utils/cleanupBadUrls';
import { runStorageCleanup } from '../utils/cleanupEmptyFiles';
import { runFullCleanup } from '../utils/runCleanup';

const QuickDiagnosticsPanel = ({ onClose }) => {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Running comprehensive diagnostics...');
      
      // Run all diagnostic checks
      const diagnostics = await runComprehensiveDiagnostics();
      const cleanup = await runCleanupDiagnostics();
      const storage = await runStorageCleanup();
      
      setResults({
        diagnostics,
        cleanup,
        storage,
        timestamp: new Date().toISOString()
      });
      
      const totalIssues = (cleanup.totalIssues || 0) + (storage.before?.empty || 0);
      
      Alert.alert(
        'Diagnostics Complete',
        `Found ${totalIssues} total issues. Database: ${cleanup.totalIssues || 0}, Storage: ${storage.before?.empty || 0}. Check console for details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      Alert.alert('Error', `Diagnostics failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runCleanup = async () => {
    Alert.alert(
      'Clean Up Bad URLs',
      'This will mark messages with local file URLs as "Image unavailable". Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean Up',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRunning(true);
              const result = await markBadMessagesAsUnavailable();
              Alert.alert(
                'Cleanup Complete',
                `Updated ${result.updated || 0} messages with bad URLs`,
                [{ text: 'OK' }]
              );
              // Re-run diagnostics to show updated state
              runFullDiagnostics();
            } catch (error) {
              console.error('❌ Cleanup error:', error);
              Alert.alert('Error', `Cleanup failed: ${error.message}`);
            } finally {
              setIsRunning(false);
            }
          }
        }
      ]
    );
  };

  const runStorageCleanupAction = async () => {
    Alert.alert(
      'Clean Up Empty Files',
      'This will delete empty/corrupted files from Supabase storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean Storage',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRunning(true);
              const result = await runStorageCleanup();
              Alert.alert(
                'Storage Cleanup Complete',
                result.message,
                [{ text: 'OK' }]
              );
              // Re-run diagnostics to show updated state
              runFullDiagnostics();
            } catch (error) {
              console.error('❌ Storage cleanup error:', error);
              Alert.alert('Error', `Storage cleanup failed: ${error.message}`);
            } finally {
              setIsRunning(false);
            }
          }
        }
      ]
    );
  };

  const runComprehensiveCleanup = async () => {
    Alert.alert(
      'Full System Cleanup',
      'This will clean both database URLs and storage files. This is comprehensive and may take time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Full Cleanup',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRunning(true);
              console.log('🚀 Running comprehensive cleanup...');
              
              const result = await runFullCleanup();
              
              Alert.alert(
                'Full Cleanup Complete',
                `Database: ${result.database?.totalFixed || 0} URLs fixed\nStorage: ${result.storage?.after?.removed || 0} files removed`,
                [{ text: 'OK' }]
              );
              
              // Re-run diagnostics to show updated state
              runFullDiagnostics();
            } catch (error) {
              console.error('❌ Full cleanup error:', error);
              Alert.alert('Error', `Full cleanup failed: ${error.message}`);
            } finally {
              setIsRunning(false);
            }
          }
        }
      ]
    );
  };

  const testUpload = () => {
    Alert.alert(
      'Test Upload',
      'Take a new photo and send it to test if uploads are working correctly.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Image Diagnostics</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={runFullDiagnostics}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running...' : '🔍 Run Full Diagnostics'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={runCleanup}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>🧹 Clean Bad URLs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={runStorageCleanupAction}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>🗑️ Clean Empty Files</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.success }]} 
            onPress={runComprehensiveCleanup}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>🔧 Full System Cleanup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testUpload}
          >
            <Text style={styles.buttonText}>📸 Test New Upload</Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Last Results:</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Messages:</Text>
              <Text style={styles.resultValue}>
                ❌ {results.cleanup?.messages?.bad || 0} bad, ✅ {results.cleanup?.messages?.good || 0} good
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Stories:</Text>
              <Text style={styles.resultValue}>
                ❌ {results.cleanup?.stories?.bad || 0} bad, ✅ {results.cleanup?.stories?.good || 0} good
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Issues:</Text>
              <Text style={[styles.resultValue, { color: results.cleanup?.totalIssues > 0 ? colors.error : colors.success }]}>
                {results.cleanup?.totalIssues || 0}
              </Text>
            </View>

            <Text style={styles.note}>
              💡 Check console logs for detailed diagnostic information
            </Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>
            1. Run "Full Diagnostics" to analyze the current state
          </Text>
          <Text style={styles.instructionText}>
            2. If bad URLs are found, use "Clean Bad URLs" to fix them
          </Text>
          <Text style={styles.instructionText}>
            3. Test new uploads to ensure the fix is working
          </Text>
          <Text style={styles.instructionText}>
            4. Remove this component when done debugging
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    zIndex: 1000,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  warningButton: {
    backgroundColor: colors.warning || '#FF9500',
  },
  secondaryButton: {
    backgroundColor: colors.secondary || '#6B7280',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  results: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
  instructions: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default QuickDiagnosticsPanel; 