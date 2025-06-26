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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import { useFriends } from '../hooks/useFriends';
import { useChats } from '../hooks/useChat';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { uploadChatImage } from '../utils/imageUploader';
import RAGCaptionSuggestor from '../components/RAGCaptionSuggestor';

const SendToFriendsScreen = ({ route, navigation }) => {
  const { photoUri, isFromGallery = false, previousScreen, chatId } = route.params;
  const { friends, loading } = useFriends();
  const { createChat } = useChats();
  const { user } = useAuth();
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [sending, setSending] = useState(false);
  
  // RAG Feature Integration
  const [caption, setCaption] = useState('');
  const [showRAGCaptions, setShowRAGCaptions] = useState(false);

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

  // RAG Handler Functions
  const handleSelectCaption = (selectedCaption) => {
    console.log('✅ RAG: Selected caption:', selectedCaption);
    setCaption(selectedCaption);
  };

  const handleOpenRAGCaptions = () => {
    console.log('🤖 RAG: Opening caption suggestions');
    setShowRAGCaptions(true);
  };

  const uploadImage = async (uri) => {
    try {
      console.log('🚀 Uploading chat image...');
      
      // Use the new clean uploader
      const uploadResult = await uploadChatImage(uri, user.id);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      console.log('✅ Chat image upload succeeded:', uploadResult);
      return uploadResult.publicUrl;
      
    } catch (error) {
      console.error('❌ Chat image upload failed:', error);
      throw error;
    }
  };

  const sendToFriends = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('No Friends Selected', 'Please select at least one friend to send the photo to.');
      return;
    }

    setSending(true);
    try {
      // Upload the image first - this MUST succeed before we proceed
      console.log('🚀 Starting photo send process...');
      console.log('📂 Photo URI to upload:', photoUri);
      
      const imageUrl = await uploadImage(photoUri);
      console.log('📸 Image uploaded successfully, URL:', imageUrl);
      
      // Validate the uploaded URL
      if (!imageUrl || !imageUrl.startsWith('https://')) {
        throw new Error(`Invalid upload result: ${imageUrl}`);
      }
      
      console.log('✅ Upload validation passed, proceeding to send messages...');

      let successCount = 0;
      let lastChatId = null;

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
          
          lastChatId = chatId;
          
          console.log(`📤 Sending message to friend ${friend.display_name} in chat ${chatId}`);
          console.log(`📎 Using media URL: ${imageUrl}`);
          
          // Send the image message with the validated URL
          const messageContent = caption || (isFromGallery ? 'Sent a photo from gallery' : 'Sent a snap');
          const { error } = await supabase
            .from('messages')
            .insert([
              {
                chat_id: chatId,
                sender_id: user.id,
                content: messageContent,
                message_type: 'image',
                media_url: imageUrl, // This is now guaranteed to be a proper HTTPS URL
                disappear_after_seconds: isFromGallery ? null : 10,
                max_views: isFromGallery ? null : 1,
              }
            ]);

          if (error) {
            console.error(`❌ Error sending message to ${friend.display_name}:`, error);
            throw error;
          }

          console.log(`✅ Message sent successfully to ${friend.display_name}`);

          // Update chat's last message timestamp
          await supabase
            .from('chats')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', chatId);
            
          successCount++;
        } catch (friendError) {
          console.error(`❌ Error sending to friend ${friend.display_name}:`, friendError);
          // Continue with other friends even if one fails
        }
      }

      if (successCount > 0) {
        Alert.alert(
          '📸 Sent!', 
          `Photo sent to ${successCount} of ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to Camera and clear modal state
                navigation.navigate('MainTabs', { 
                  screen: 'Camera',
                  params: { shouldClearModal: true }
                });
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to send to any friends');
      }
    } catch (error) {
      console.error('❌ Error in send process:', error);
      Alert.alert(
        'Send Failed', 
        `Failed to send photo: ${error.message}. Please try again.`,
        [{ text: 'OK' }]
      );
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

      {/* RAG Caption Input Section */}
      <View style={styles.captionSection}>
        <View style={styles.captionInputContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption for your snap..."
            placeholderTextColor={colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.ragButton}
          onPress={handleOpenRAGCaptions}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.ragButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.ragButtonText}>AI</Text>
          </LinearGradient>
        </TouchableOpacity>
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

      {/* RAG Caption Suggestor Modal */}
      <RAGCaptionSuggestor
        visible={showRAGCaptions}
        onClose={() => setShowRAGCaptions(false)}
        onSelectCaption={handleSelectCaption}
        contentType="study_group"
        imageContext="Study group photo"
      />
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
  captionSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  captionInputContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  captionInput: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 20,
  },
  ragButton: {
    borderRadius: 12,
  },
  ragButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  ragButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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