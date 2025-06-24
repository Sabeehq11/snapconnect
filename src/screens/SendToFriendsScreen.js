import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import { useFriends } from '../hooks/useFriends';
import { useChats } from '../hooks/useChat';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SendToFriendsScreen = ({ route, navigation }) => {
  const { photoUri, isFromGallery = false } = route.params;
  const { friends, loading } = useFriends();
  const { createChat } = useChats();
  const { user } = useAuth();
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [sending, setSending] = useState(false);

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.find(f => f.id === friend.id);
      if (isSelected) {
        return prev.filter(f => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const uploadImage = async (uri) => {
    try {
      console.log('🔄 Starting image upload for URI:', uri);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create unique filename with proper path structure: userId/snap_TIMESTAMP.jpg
      const timestamp = Date.now();
      const fileName = `snap_${timestamp}.jpg`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('📁 Uploading to path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ Upload successful:', data);

      // Generate public URL for the uploaded file
      const { data: publicData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', publicData.publicUrl);

      // Verify the URL is accessible
      try {
        const testResponse = await fetch(publicData.publicUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          console.warn('⚠️ Public URL might not be accessible:', testResponse.status);
        } else {
          console.log('✅ Public URL verified as accessible');
        }
      } catch (testError) {
        console.warn('⚠️ Could not verify public URL accessibility:', testError);
      }

      return publicData.publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error; // Don't use fallback - we want to know if upload fails
    }
  };

  const sendToFriends = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('No Friends Selected', 'Please select at least one friend to send the photo to.');
      return;
    }

    setSending(true);
    try {
      // Upload the image first
      console.log('🚀 Starting photo send process...');
      const imageUrl = await uploadImage(photoUri);
      console.log('📸 Image uploaded successfully, URL:', imageUrl);

      // Send to each selected friend
      for (const friend of selectedFriends) {
        try {
          // Create or get existing chat - check if one already exists first
          let chatId;
          const { data: existingChats } = await supabase
            .from('chats')
            .select('id')
            .contains('participants', [user.id])
            .contains('participants', [friend.id]);

          if (existingChats && existingChats.length > 0) {
            // Use existing chat
            chatId = existingChats[0].id;
          } else {
            // Create new chat
            const chatData = await createChat([friend.id]);
            chatId = chatData.id;
          }
          
          // Send the image message
          const { error } = await supabase
            .from('messages')
            .insert([
              {
                chat_id: chatId,
                sender_id: user.id,
                content: isFromGallery ? 'Sent a photo from gallery' : 'Sent a snap',
                message_type: 'image',
                media_url: imageUrl,
                disappear_after_seconds: isFromGallery ? null : 10,
                max_views: isFromGallery ? null : 1,
              }
            ]);

          if (error) {
            console.error('Error sending message:', error);
            throw error;
          }

          // Update chat's last message timestamp
          await supabase
            .from('chats')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', chatId);
        } catch (friendError) {
          console.error(`Error sending to friend ${friend.id}:`, friendError);
          // Continue with other friends even if one fails
        }
      }

      Alert.alert(
        '📸 Sent!', 
        `Photo sent to ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Chat' })
          }
        ]
      );
    } catch (error) {
      console.error('Error sending photo:', error);
      Alert.alert('Error', 'Failed to send photo. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriends.find(f => f.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item)}
      >
        <View style={styles.friendInfo}>
          <View style={styles.avatar}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.display_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{item.display_name}</Text>
            <Text style={styles.friendUsername}>@{item.username}</Text>
          </View>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Send To</Text>
        
        <TouchableOpacity 
          style={[styles.sendHeaderButton, selectedFriends.length === 0 && styles.sendHeaderButtonDisabled]}
          onPress={sendToFriends}
          disabled={sending || selectedFriends.length === 0}
        >
          <Text style={[styles.sendHeaderButtonText, selectedFriends.length === 0 && styles.sendHeaderButtonTextDisabled]}>
            {sending ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Photo Preview */}
      <View style={styles.photoPreview}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      </View>

      {/* Selected Count */}
      {selectedFriends.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Friends List */}
      <View style={styles.friendsList}>
        <Text style={styles.sectionTitle}>Friends</Text>
        
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No friends to send to</Text>
            <Text style={styles.emptyStateSubtext}>Add some friends first!</Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.friendsListContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  sendHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  sendHeaderButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  sendHeaderButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  sendHeaderButtonTextDisabled: {
    color: colors.textTertiary,
  },
  photoPreview: {
    height: 120,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  selectedCountText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  friendsListContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  friendItemSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
  friendUsername: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
});

export default SendToFriendsScreen; 