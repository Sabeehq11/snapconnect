import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ImageWithFallback from './ImageWithFallback';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 3; // 3 columns with margins

const TabbedImagePicker = ({ visible, onClose, onSelectImage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryImages, setGalleryImages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContent();
    }
  }, [visible, activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'gallery') {
        await loadGalleryImages();
      } else {
        await loadMemories();
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGalleryImages = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need gallery access to show your photos');
        return;
      }

      console.log('📸 Loading gallery images...');
      
      // Get all photos from device, sorted by creation time (newest first)
      const allAssets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: 'creationTime',
        first: 100, // Increased limit
      });

      console.log(`📸 Found ${allAssets.totalCount} total photos, loaded ${allAssets.assets.length}`);
      
      if (allAssets.assets.length === 0) {
        console.log('📸 No assets found in MediaLibrary, trying alternative approach...');
        // Fallback: show message about creating images through camera
        setGalleryImages([]);
        return;
      }
      
      // Get asset info with proper URIs for display
      const assetsWithInfo = await Promise.all(
        allAssets.assets.map(async (asset) => {
          try {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
            
            // Log the URIs for debugging
            console.log('📸 Asset URI conversion:', {
              originalUri: asset.uri,
              assetInfoUri: assetInfo.uri,
              localUri: assetInfo.localUri
            });
            
            // Use localUri (file://) if available, otherwise fall back to assetInfo.uri
            const displayUri = assetInfo.localUri || assetInfo.uri || asset.uri;
            
            return {
              ...asset,
              uri: displayUri,
              originalUri: asset.uri, // Keep original for reference
            };
          } catch (error) {
            console.log('Error getting asset info:', error);
            return {
              ...asset,
              uri: asset.uri, // Use original URI as fallback
            };
          }
        })
      );

      console.log('📸 Gallery assets with URIs:', assetsWithInfo.slice(0, 3)); // Log first 3 for debugging
      setGalleryImages(assetsWithInfo || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
      Alert.alert('Error', 'Failed to load gallery images. This might be due to Expo Go limitations - try using a development build for full media library access.');
      setGalleryImages([]);
    }
  };

  const loadMemories = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
      // For now, show mock data if there's an error
      setMemories([]);
    }
  };

  const handleImageSelect = async (item) => {
    try {
      let imageUri;
      
      if (activeTab === 'gallery') {
        // For gallery images, use the asset URI
        imageUri = item.uri;
      } else {
        // For memories, use the stored media URL
        imageUri = item.media_url;
      }

      console.log('Selected image:', imageUri);
      onSelectImage(imageUri);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const renderGalleryItem = ({ item }) => {
    console.log('🖼️ Rendering gallery item:', { uri: item.uri, originalUri: item.originalUri });
    return (
      <TouchableOpacity
        style={styles.imageItem}
        onPress={() => handleImageSelect(item)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.uri }} 
          style={styles.image}
          onError={(error) => {
            console.log('❌ Gallery image load error:', error.nativeEvent.error, 'for URI:', item.uri);
          }}
          onLoad={() => {
            console.log('✅ Gallery image loaded successfully for:', item.uri);
          }}
        />
        {/* Fallback indicator for gallery items */}
        <View style={styles.galleryIndicator}>
          <Ionicons name="image" size={10} color={colors.white} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMemoryItem = ({ item }) => {
    console.log('🖼️ Rendering memory item:', item.media_url);
    return (
      <TouchableOpacity
        style={styles.imageItem}
        onPress={() => handleImageSelect(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.media_url }}
          style={styles.image}
          onError={(error) => {
            console.log('❌ Memory image load error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('✅ Memory image loaded successfully');
          }}
        />
        <View style={styles.memoryOverlay}>
          <Ionicons name="camera" size={12} color={colors.white} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
        style={styles.emptyIcon}
      >
        <Ionicons 
          name={activeTab === 'gallery' ? 'images' : 'camera'} 
          size={40} 
          color={colors.primary} 
        />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {activeTab === 'gallery' ? 'No Photos Found' : 'No Memories Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'gallery' 
          ? 'Gallery may be empty due to Expo Go limitations. For full gallery access, create a development build or use the camera to take new photos.'
          : 'Saved photos from the app will appear here'
        }
      </Text>
    </View>
  );

  const currentData = activeTab === 'gallery' ? galleryImages : memories;
  const renderItem = activeTab === 'gallery' ? renderGalleryItem : renderMemoryItem;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Image</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
              Photo Gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'memories' && styles.activeTab]}
            onPress={() => setActiveTab('memories')}
          >
            <Text style={[styles.tabText, activeTab === 'memories' && styles.activeTabText]}>
              Memories
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : currentData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={currentData}
              renderItem={renderItem}
              keyExtractor={(item) => activeTab === 'gallery' ? item.id : item.id}
              numColumns={3}
              contentContainerStyle={styles.imageGrid}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    marginTop: 20,
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
  imageGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 2,
  },
});

export default TabbedImagePicker; 