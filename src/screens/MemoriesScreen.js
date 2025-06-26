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

  const loadMemories = async () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Mock memories data - in real implementation, this would come from Supabase
      const mockMemories = [
        {
          id: 'memory-1',
          media_url: 'https://picsum.photos/400/600?random=10',
          media_type: 'image',
          caption: 'Best study session ever! 📚',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          saved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'memory-2',
          media_url: 'https://picsum.photos/400/600?random=11',
          media_type: 'image',
          caption: 'Campus sunset vibes 🌅',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          saved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'memory-3',
          media_url: 'https://picsum.photos/400/600?random=12',
          media_type: 'image',
          caption: 'Squad goals achieved! 🎯',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          saved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'memory-4',
          media_url: 'https://picsum.photos/400/600?random=13',
          media_type: 'image',
          caption: 'Coffee shop coding session ☕',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          saved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'memory-5',
          media_url: 'https://picsum.photos/400/600?random=14',
          media_type: 'image',
          caption: 'Late night dorm adventures 🌙',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          saved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'memory-6',
          media_url: 'https://picsum.photos/400/600?random=15',
          media_type: 'image',
          caption: 'Game day spirit! 🏈',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
          saved_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      setMemories(mockMemories);
      setLoading(false);
    }, 800);
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

  const handleDeleteMemory = (memoryId) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMemories(prev => prev.filter(m => m.id !== memoryId));
            setSelectedMemory(null);
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
            Save your favorite snaps to see them here
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