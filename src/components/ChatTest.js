import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useChats, useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

const ChatTest = () => {
  const { user } = useAuth();
  const { chats, loading: chatsLoading, createChat } = useChats();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  const { messages, loading: messagesLoading, sendMessage } = useChat(selectedChatId);

  const handleCreateTestChat = async () => {
    try {
      // For testing, create a chat with just the current user
      // In a real app, you'd select other users
      const newChat = await createChat([]);
      Alert.alert('Success', `Created test chat: ${newChat.id}`);
    } catch (error) {
      Alert.alert('Error', `Failed to create chat: ${error.message}`);
    }
  };

  const handleSendTestMessage = async () => {
    if (!selectedChatId || !testMessage.trim()) return;
    
    try {
      await sendMessage(testMessage);
      setTestMessage('');
      Alert.alert('Success', 'Message sent!');
    } catch (error) {
      Alert.alert('Error', `Failed to send message: ${error.message}`);
    }
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        selectedChatId === item.id && styles.selectedChat
      ]}
      onPress={() => setSelectedChatId(item.id)}
    >
      <Text style={styles.chatId}>Chat ID: {item.id}</Text>
      <Text style={styles.participants}>
        Participants: {item.participants?.length || 0}
      </Text>
      {item.last_message && (
        <Text style={styles.lastMessage}>
          Last: {item.last_message.content}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.last_message_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageSender}>
        From: {item.sender?.display_name || item.sender_id}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Test Component</Text>
      <Text style={styles.subtitle}>User: {user?.email}</Text>

      {/* Test Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleCreateTestChat}>
          <Text style={styles.buttonText}>Create Test Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chats List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Chats ({chatsLoading ? 'Loading...' : chats.length})
        </Text>
        {chats.length > 0 ? (
          <FlatList
            data={chats}
            renderItem={renderChat}
            keyExtractor={(item) => item.id}
            style={styles.chatsList}
          />
        ) : (
          <Text style={styles.emptyText}>
            {chatsLoading ? 'Loading chats...' : 'No chats found. Create one to test!'}
          </Text>
        )}
      </View>

      {/* Messages for selected chat */}
      {selectedChatId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Messages ({messagesLoading ? 'Loading...' : messages.length})
          </Text>
          
          {/* Send message input */}
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              value={testMessage}
              onChangeText={setTestMessage}
              placeholder="Type a test message..."
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendTestMessage}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          {messages.length > 0 ? (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
            />
          ) : (
            <Text style={styles.emptyText}>
              {messagesLoading ? 'Loading messages...' : 'No messages. Send one to test!'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  controls: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatsList: {
    maxHeight: 200,
  },
  messagesList: {
    maxHeight: 200,
  },
  chatItem: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedChat: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  chatId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  participants: {
    fontSize: 14,
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messageItem: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  messageContent: {
    fontSize: 16,
  },
  messageSender: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  messageInput: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: 'white',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default ChatTest; 