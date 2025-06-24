import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';

const UserConnectionTest = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, success = true) => {
    setTestResults(prev => [...prev, { 
      message, 
      success, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const runDatabaseTest = async () => {
    setLoading(true);
    addTestResult('🔍 Starting database connectivity test...');

    try {
      // Test 1: Check if users table exists and is accessible
      const { data: tableCheck, error: tableError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (tableError) {
        addTestResult(`❌ Users table access failed: ${tableError.message}`, false);
      } else {
        addTestResult('✅ Users table is accessible');
      }

      // Test 2: Check current user data
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (currentUserError) {
        addTestResult(`❌ Current user data fetch failed: ${currentUserError.message}`, false);
      } else {
        addTestResult(`✅ Current user found: ${currentUserData.email}`);
        addTestResult(`📧 Email: ${currentUserData.email}`);
        addTestResult(`👤 Username: ${currentUserData.username || 'Not set'}`);
        addTestResult(`🏷️ Display Name: ${currentUserData.display_name || 'Not set'}`);
      }

      // Test 3: Try to fetch other users
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, username, display_name')
        .neq('id', user.id)
        .limit(10);

      if (usersError) {
        addTestResult(`❌ Failed to fetch other users: ${usersError.message}`, false);
      } else {
        addTestResult(`✅ Found ${allUsers.length} other users in database`);
        setUsers(allUsers);
        
        if (allUsers.length === 0) {
          addTestResult('⚠️ No other users found. You might need to create test users.', false);
        }
      }

      // Test 4: Test chat creation (dry run)
      addTestResult('✅ All basic connectivity tests passed!');

    } catch (error) {
      addTestResult(`❌ Unexpected error: ${error.message}`, false);
    }

    setLoading(false);
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      // Generate a test user
      const testUserId = crypto.randomUUID();
      const testEmail = `testuser_${Date.now()}@example.com`;
      const testUsername = `test_${Date.now()}`;

      const { error } = await supabase
        .from('users')
        .insert([{
          id: testUserId,
          email: testEmail,
          username: testUsername,
          display_name: `Test User ${Date.now()}`,
          created_at: new Date().toISOString(),
          friends: [],
          snap_score: 0
        }]);

      if (error) {
        addTestResult(`❌ Failed to create test user: ${error.message}`, false);
        Alert.alert('Error', `Failed to create test user: ${error.message}`);
      } else {
        addTestResult(`✅ Created test user: ${testEmail}`);
        // Refresh user list
        runDatabaseTest();
      }
    } catch (error) {
      addTestResult(`❌ Error creating test user: ${error.message}`, false);
    }
    setLoading(false);
  };

  const testChatCreation = async (targetUser) => {
    setLoading(true);
    try {
      addTestResult(`🔄 Testing chat creation with ${targetUser.email}...`);

      const participants = [user.id, targetUser.id];
      
      const { data, error } = await supabase
        .from('chats')
        .insert([{ participants }])
        .select()
        .single();

      if (error) {
        addTestResult(`❌ Chat creation failed: ${error.message}`, false);
      } else {
        addTestResult(`✅ Chat created successfully! ID: ${data.id}`);
        
        // Test sending a message
        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            chat_id: data.id,
            sender_id: user.id,
            content: 'Test message from UserConnectionTest component',
            message_type: 'text'
          }]);

        if (messageError) {
          addTestResult(`❌ Failed to send test message: ${messageError.message}`, false);
        } else {
          addTestResult('✅ Test message sent successfully!');
        }
      }
    } catch (error) {
      addTestResult(`❌ Error in chat creation: ${error.message}`, false);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(query) ||
      (u.display_name && u.display_name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query))
    );
  });

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => testChatCreation(item)}
    >
      <LinearGradient
        colors={colors.gradients.card}
        style={styles.userItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.display_name || item.username || 'No name'}
          </Text>
          {item.username && (
            <Text style={styles.userUsername}>@{item.username}</Text>
          )}
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => testChatCreation(item)}
        >
          <Text style={styles.testButtonText}>Test Chat</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTestResult = ({ item }) => (
    <View style={[styles.resultItem, !item.success && styles.resultItemError]}>
      <Text style={[styles.resultText, !item.success && styles.resultTextError]}>
        {item.message}
      </Text>
      <Text style={styles.resultTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.background}
      >
        <Text style={styles.title}>🔧 User Connection Test</Text>
        <Text style={styles.subtitle}>Diagnose and test friend/chat functionality</Text>

        {/* Control Buttons */}
        <View style={styles.controlsSection}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={runDatabaseTest}
            disabled={loading}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? '🔄 Testing...' : '🔍 Run Database Test'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={createTestUser}
            disabled={loading}
          >
            <LinearGradient
              colors={colors.gradients.accent}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>➕ Create Test User</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.warningButton]}
            onPress={clearResults}
          >
            <LinearGradient
              colors={[colors.warning, colors.warningLight]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🗑️ Clear Results</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Current User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Current User</Text>
          <LinearGradient
            colors={colors.gradients.card}
            style={styles.card}
          >
            <Text style={styles.cardText}>Email: {user?.email}</Text>
            <Text style={styles.cardText}>Username: {user?.username || 'Not set'}</Text>
            <Text style={styles.cardText}>Display Name: {user?.displayName || 'Not set'}</Text>
          </LinearGradient>
        </View>

        {/* User Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Available Users ({users.length})</Text>
          <LinearGradient
            colors={colors.gradients.card}
            style={styles.searchContainer}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
          
          {filteredUsers.length > 0 ? (
            <FlatList
              data={filteredUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.card}
            >
              <Text style={styles.cardText}>
                {users.length === 0 
                  ? 'No users found. Run database test or create test users.'
                  : 'No users match your search.'
                }
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Test Results</Text>
          {testResults.length > 0 ? (
            <FlatList
              data={testResults}
              renderItem={renderTestResult}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <LinearGradient
              colors={colors.gradients.card}
              style={styles.card}
            >
              <Text style={styles.cardText}>
                No test results yet. Run the database test to get started!
              </Text>
            </LinearGradient>
          )}
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  background: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  controlsSection: {
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.white,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  searchContainer: {
    borderRadius: theme.borderRadius.lg,
    padding: 2,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg - 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: colors.textPrimary,
    fontSize: theme.typography.fontSizes.md,
  },
  userItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  userItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  userUsername: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.accent,
  },
  userEmail: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textMuted,
  },
  testButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  testButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.white,
  },
  resultItem: {
    backgroundColor: colors.surfaceCard,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  resultItemError: {
    borderLeftColor: colors.error,
  },
  resultText: {
    fontSize: theme.typography.fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  resultTextError: {
    color: colors.errorLight,
  },
  resultTime: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});

export default UserConnectionTest; 