import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../utils/colors';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const TutorialScreen = ({ visible, onComplete }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const tutorialPages = [
    {
      id: 'welcome',
      title: '👋 Welcome to SnapConnect!',
      subtitle: `Hi ${user?.displayName || user?.username || 'there'}!`,
      description: 'Your ultimate social campus experience awaits. Let\'s take a quick tour of all the amazing features!',
      icon: 'sparkles',
      gradient: colors.gradients.primary,
    },
    {
      id: 'chat',
      title: '💬 Chat & Connect',
      subtitle: 'Stay Connected with Friends',
      description: 'Send messages, create group chats, and chat with our AI assistant. Get real-time notifications and never miss a conversation!',
      features: [
        '• Create 1-on-1 and group chats',
        '• AI-powered chat assistant',
        '• Real-time messaging',
        '• Disappearing messages',
        '• Message reactions'
      ],
      icon: 'chatbubbles',
      gradient: colors.gradients.accent,
    },
    {
      id: 'camera',
      title: '📸 Camera & Creativity',
      subtitle: 'Capture & Share Moments',
      description: 'Take stunning photos with AR filters, get AI story suggestions, and share with friends or post to your story!',
      features: [
        '• Front and back camera',
        '• AR filters and effects',
        '• AI-powered story ideas',
        '• Gallery image picker',
        '• Flash and camera controls'
      ],
      icon: 'camera',
      gradient: colors.gradients.secondary,
    },
    {
      id: 'stories',
      title: '📖 Stories & Campus Life',
      subtitle: 'Share Your Campus Experience',
      description: 'View friends\' stories, explore campus content, find best places, track your mood, and stay updated with events!',
      features: [
        '• View and post stories',
        '• Campus stories with tags',
        '• Best campus places',
        '• School events calendar',
        '• Mood tracker',
        '• Academic status updates'
      ],
      icon: 'play-circle',
      gradient: colors.gradients.primary,
    },
    {
      id: 'profile',
      title: '👤 Profile & Social',
      subtitle: 'Build Your Network',
      description: 'Manage your profile, add friends, handle requests, discover new connections, and access your memories!',
      features: [
        '• Edit your profile',
        '• Add and manage friends',
        '• Friend requests system',
        '• Discover new friends',
        '• View your memories',
        '• Settings and preferences'
      ],
      icon: 'person',
      gradient: colors.gradients.accent,
    },
    {
      id: 'features',
      title: '🌟 Special Features',
      subtitle: 'Powered by AI',
      description: 'Enjoy AI-enhanced features throughout the app for a smarter, more personalized experience!',
      features: [
        '• RAG story caption suggestions',
        '• AI-powered story ideas',
        '• Smart text suggestions',
        '• Crisis resources access',
        '• Academic status tracking',
        '• Campus event discovery'
      ],
      icon: 'bulb',
      gradient: colors.gradients.secondary,
    },
    {
      id: 'ready',
      title: '🚀 You\'re All Set!',
      subtitle: 'Ready to Explore',
      description: 'You now know all the features SnapConnect has to offer. Start connecting, sharing, and exploring your campus community!',
      icon: 'checkmark-circle',
      gradient: colors.gradients.primary,
    }
  ];

  useEffect(() => {
    // Animate page transitions
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {tutorialPages.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage && styles.activeDot
          ]}
        />
      ))}
    </View>
  );

  const renderPage = ({ item, index }) => (
    <Animated.View style={[styles.pageContainer, { transform: [{ scale: scaleAnimation }] }]}>
      <LinearGradient
        colors={item.gradient}
        style={styles.pageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name={item.icon} size={60} color={colors.white} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>{item.title}</Text>
          <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
          <Text style={styles.pageDescription}>{item.description}</Text>

          {/* Features List */}
          {item.features && (
            <View style={styles.featuresContainer}>
              {item.features.map((feature, idx) => (
                <Text key={idx} style={styles.featureText}>{feature}</Text>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
          <View style={styles.closeButtonBackground}>
            <Ionicons name="close" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Pages */}
        <FlatList
          ref={flatListRef}
          data={tutorialPages}
          renderItem={renderPage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.flatList}
        />

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {renderDots()}
          
          <View style={styles.buttonsContainer}>
            {currentPage > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.primaryButton, currentPage === 0 && styles.singleButton]} 
              onPress={handleNext}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>
                  {currentPage === tutorialPages.length - 1 ? "Let's Go!" : 'Next'}
                </Text>
                <Ionicons 
                  name={currentPage === tutorialPages.length - 1 ? "rocket" : "arrow-forward"} 
                  size={20} 
                  color={colors.white} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  closeButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  pageContainer: {
    width,
    flex: 1,
  },
  pageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: '90%',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  pageDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 22,
  },
  navigationContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  primaryButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 25,
    overflow: 'hidden',
  },
  singleButton: {
    marginLeft: 0,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TutorialScreen; 