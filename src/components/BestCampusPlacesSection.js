import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const BestCampusPlacesSection = ({ onPlacePress }) => {
  const [campusPlaces, setCampusPlaces] = useState([]);

  useEffect(() => {
    loadCampusPlaces();
  }, []);

  const loadCampusPlaces = () => {
    // Mock campus places data
    const places = [
      {
        id: 'place-1',
        title: 'Main Library',
        description: 'Perfect study spot with quiet zones',
        icon: '📚',
        category: 'Study',
        hours: '24/7',
        popularity: 95,
        rating: 4.8,
        color: colors.primary,
      },
      {
        id: 'place-2',
        title: 'Campus Coffee Shop',
        description: 'Best coffee and study atmosphere',
        icon: '☕',
        category: 'Food & Drink',
        hours: '6 AM - 10 PM',
        popularity: 88,
        rating: 4.5,
        color: colors.warning,
      },
      {
        id: 'place-3',
        title: 'Student Union',
        description: 'Hub for events and activities',
        icon: '🏫',
        category: 'Social',
        hours: '8 AM - 11 PM',
        popularity: 92,
        rating: 4.7,
        color: colors.accent,
      },
      {
        id: 'place-4',
        title: 'Campus Dining Hall',
        description: 'Fresh meals and social dining',
        icon: '🍽️',
        category: 'Dining',
        hours: '7 AM - 9 PM',
        popularity: 85,
        rating: 4.2,
        color: colors.secondary,
      },
      {
        id: 'place-5',
        title: 'Recreation Center',
        description: 'Full gym and fitness facilities',
        icon: '💪',
        category: 'Fitness',
        hours: '5 AM - 11 PM',
        popularity: 90,
        rating: 4.6,
        color: colors.success,
      },
      {
        id: 'place-6',
        title: 'Campus Gardens',
        description: 'Beautiful outdoor study space',
        icon: '🌸',
        category: 'Outdoor',
        hours: 'Dawn - Dusk',
        popularity: 78,
        rating: 4.3,
        color: colors.teal,
      },
    ];
    
    setCampusPlaces(places);
  };

  const handlePlacePress = (place) => {
    if (onPlacePress) {
      onPlacePress(place);
    } else {
      Alert.alert(
        place.title,
        `${place.description}\n\nHours: ${place.hours}\nPopularity: ${place.popularity}%`,
        [
          { text: 'Get Directions', onPress: () => console.log('Get directions to', place.title) },
          { text: 'Share Story Here', onPress: () => console.log('Create story at', place.title) },
          { text: 'Close', style: 'cancel' }
        ]
      );
    }
  };

  const renderPlaceItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.placeCard, { marginLeft: index === 0 ? 20 : 0 }]}
      activeOpacity={0.8}
      onPress={() => handlePlacePress(item)}
    >
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}10`]}
        style={styles.placeCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.placeHeader}>
          <View style={[styles.placeIcon, { backgroundColor: item.color }]}>
            <Text style={styles.placeIconText}>{item.icon}</Text>
          </View>
          <View style={styles.popularityBadge}>
            <Ionicons name="flame" size={12} color={colors.white} />
            <Text style={styles.popularityText}>{item.popularity}%</Text>
          </View>
        </View>
        
        <View style={styles.placeContent}>
          <Text style={styles.placeTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.placeDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.placeRating}>
            <View style={styles.starContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(item.rating) ? 'star' : 'star-outline'}
                  size={12}
                  color={i < Math.floor(item.rating) ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.placeFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.placeHours}>{item.hours}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Best Campus Places</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={campusPlaces}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.placesContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 196, // 180 width + 16 margin
          offset: 196 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed marginVertical since parent wrapper handles spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  placesContainer: {
    paddingRight: 20,
  },
  placeCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeCardGradient: {
    padding: 16,
    minHeight: 140,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  placeIconText: {
    fontSize: 20,
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularityText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  placeContent: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  placeHours: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500',
  },
});

export default BestCampusPlacesSection; 