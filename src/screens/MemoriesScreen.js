import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/colors';
import ImageWithFallback from '../components/ImageWithFallback';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 3; // 3 columns with margins

const MemoriesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  // Reload memories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMemories();
    }, [])
  );

  const loadMemories = async () => {
    if (!user) {
      console.log('📸 No user found, skipping memories load');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      console.log('📸 Loading memories from database for user:', user.id);
      
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading memories:', error);
        throw error;
      }

      console.log('✅ Loaded memories from database:', data?.length || 0);
      setMemories(data || []);
      
    } catch (error) {
      console.error('❌ Failed to load memories:', error);
      Alert.alert(
        'Failed to Load Memories',
        'Could not load your saved memories. Please try again.',
        [{ text: 'OK' }]
      );
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMemoryPress = (memory) => {
    setSelectedMemory(memory);
  };

  const handleDeleteMemory = async (memoryId) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting memory:', memoryId);
              
              const { error } = await supabase
                .from('memories')
                .delete()
                .eq('id', memoryId)
                .eq('user_id', user.id); // Extra security check

              if (error) {
                console.error('❌ Error deleting memory:', error);
                throw error;
              }

              console.log('✅ Memory deleted successfully');
              
              // Update local state
              setMemories(prev => prev.filter(m => m.id !== memoryId));
              setSelectedMemory(null);
              
              Alert.alert('Deleted', 'Memory deleted successfully');
            } catch (error) {
              console.error('❌ Failed to delete memory:', error);
              Alert.alert('Error', 'Failed to delete memory. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderMemoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memoryItem}
      activeOpacity={0.8}
      onPress={() => handleMemoryPress(item)}
    >
      <ImageWithFallback
        source={{ uri: item.media_url }}
        style={styles.memoryImage}
        fallbackStyle={styles.memoryImageFallback}
      />
      <View style={styles.memoryOverlay}>
        <Text style={styles.memoryDate}>{formatDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMemoryModal = () => (
    <Modal
      visible={!!selectedMemory}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setSelectedMemory(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedMemory(null)}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalDeleteButton}
              onPress={() => handleDeleteMemory(selectedMemory?.id)}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          
          {selectedMemory && (
            <>
              <ImageWithFallback
                source={{ uri: selectedMemory.media_url }}
                style={styles.modalImage}
                fallbackStyle={styles.modalImageFallback}
              />
              <View style={styles.modalContent}>
                <Text style={styles.modalCaption}>{selectedMemory.caption}</Text>
                <Text style={styles.modalDate}>
                  Saved {formatDate(selectedMemory.saved_at)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memories</Text>
        <TouchableOpacity onPress={loadMemories}>
          <Ionicons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Memories Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your memories...</Text>
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.emptyIcon}
          >
            <Ionicons name="camera" size={40} color={colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Memories Yet</Text>
          <Text style={styles.emptySubtitle}>
            Take photos with the camera and save them to memories to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          renderItem={renderMemoryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.memoriesGrid}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderMemoryModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  memoriesGrid: {
    padding: 20,
  },
  memoryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.2,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  memoryImageFallback: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  memoryDate: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalDeleteButton: {
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalImageFallback: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalCaption: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 8,
    lineHeight: 22,
  },
  modalDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default MemoriesScreen; 