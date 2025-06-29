import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const CrisisResourcesSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [borderGlow] = useState(new Animated.Value(0));

  // Add border glow animation for attention (but remove pulsing)
  useEffect(() => {
    const startBorderGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(borderGlow, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startBorderGlow();
  }, []);

  const crisisResources = [
    {
      id: 'hotline-1',
      title: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support hotline',
      icon: 'call',
      color: colors.error,
      type: 'emergency'
    },
    {
      id: 'hotline-2',
      title: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free 24/7 crisis support via text',
      icon: 'chatbubble',
      color: colors.primary,
      type: 'text'
    },
    {
      id: 'campus-1',
      title: 'Campus Counseling Center',
      number: '(555) 123-4567',
      description: 'Free counseling services for students',
      icon: 'medical',
      color: colors.success,
      type: 'campus',
      hours: 'Mon-Fri 8AM-5PM'
    },
    {
      id: 'campus-2',
      title: 'Student Health Services',
      number: '(555) 123-4568',
      description: 'Medical and mental health support',
      icon: 'fitness',
      color: colors.info,
      type: 'campus',
      hours: 'Mon-Fri 9AM-4PM'
    },
    {
      id: 'advisor-1',
      title: 'Dr. Sarah Johnson',
      number: '(555) 123-4569',
      description: 'Academic & Personal Counselor',
      icon: 'person',
      color: colors.secondary,
      type: 'advisor',
      office: 'Student Services Building, Room 204'
    },
    {
      id: 'advisor-2',
      title: 'Michael Chen, LCSW',
      number: '(555) 123-4570',
      description: 'Licensed Clinical Social Worker',
      icon: 'heart',
      color: colors.accent,
      type: 'advisor',
      office: 'Counseling Center, Room 102'
    }
  ];

  const handleToggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleResourcePress = (resource) => {
    const actions = [];
    
    if (resource.type === 'emergency' || resource.type === 'campus' || resource.type === 'advisor') {
      actions.push({
        text: 'Call Now',
        onPress: () => {
          const phoneNumber = resource.number.replace(/[^\d]/g, '');
          Linking.openURL(`tel:${phoneNumber}`);
        }
      });
    }
    
    if (resource.type === 'text') {
      actions.push({
        text: 'Send Text',
        onPress: () => {
          Linking.openURL('sms:741741&body=HOME');
        }
      });
    }
    
    actions.push({ text: 'Close', style: 'cancel' });

    const details = [];
    if (resource.hours) details.push(`Hours: ${resource.hours}`);
    if (resource.office) details.push(`Office: ${resource.office}`);
    
    Alert.alert(
      resource.title,
      `${resource.description}\n\n${details.join('\n')}`,
      actions
    );
  };

  // Calculate content height dynamically
  const contentHeight = crisisResources.length * 80 + 200; // ~80px per item + spacing/headers
  
  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const borderGlowColor = borderGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.8)'],
  });

  const renderResourceItem = (resource) => (
    <TouchableOpacity
      key={resource.id}
      style={styles.resourceCard}
      activeOpacity={0.8}
      onPress={() => handleResourcePress(resource)}
    >
      <LinearGradient
        colors={[`${resource.color}15`, `${resource.color}08`]}
        style={styles.resourceCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.resourceHeader}>
          <View style={[styles.resourceIcon, { backgroundColor: resource.color }]}>
            <Ionicons name={resource.icon} size={16} color={colors.white} />
          </View>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle} numberOfLines={1}>
              {resource.title}
            </Text>
            <Text style={styles.resourceDescription} numberOfLines={2}>
              {resource.description}
            </Text>
            <Text style={styles.resourceNumber}>
              {resource.number}
            </Text>
          </View>
          <View style={styles.resourceArrow}>
            <Ionicons name="chevron-forward" size={16} color={resource.color} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Emergency Alert Header */}
      <View style={styles.emergencyAlert}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.emergencyAlertGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.emergencyAlertContent}>
            <Ionicons name="warning" size={16} color={colors.white} />
            <Text style={styles.emergencyAlertText}>
              CRISIS SUPPORT AVAILABLE 24/7
            </Text>
            <Ionicons name="shield-checkmark" size={16} color={colors.white} />
          </View>
        </LinearGradient>
      </View>

      <Animated.View style={[styles.borderGlow, { borderColor: borderGlowColor }]}>
        <TouchableOpacity 
          style={styles.header}
          activeOpacity={0.8}
          onPress={handleToggleExpanded}
        >
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.15)', 'rgba(185, 28, 28, 0.1)']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.headerIconGradient}
                  >
                    <Ionicons name="medical" size={24} color={colors.white} />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.sectionTitle}>🆘 CRISIS RESOURCES</Text>
                  <Text style={styles.sectionSubtitle}>
                    {isExpanded ? '📞 Emergency contacts below - Tap to hide' : '⚡ IMMEDIATE HELP AVAILABLE - Tap to view contacts'}
                  </Text>
                  <View style={styles.urgencyIndicator}>
                    <Text style={styles.urgencyText}>🚨 Available 24/7 • Confidential • Free</Text>
                  </View>
                </View>
              </View>
              <View style={styles.expandButton}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.2)']}
                  style={styles.expandButtonGradient}
                >
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      }],
                    }}
                  >
                    <Ionicons name="chevron-down" size={24} color={colors.white} />
                  </Animated.View>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.resourcesContainer,
          {
            height: animatedHeight,
            opacity: animatedOpacity,
          }
        ]}
      >
        <View style={styles.resourcesList}>
          <View style={styles.confidentialityBanner}>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
              style={styles.confidentialityGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="lock-closed" size={16} color={colors.success} />
              <Text style={styles.confidentialityText}>
                🔒 ALL CONVERSATIONS ARE CONFIDENTIAL • NO JUDGMENT • HELP IS HERE
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.resourcesSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons name="call" size={18} color="#EF4444" />
              <Text style={styles.resourcesSectionTitle}>🚨 EMERGENCY HOTLINES</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>
            {crisisResources
              .filter(r => r.type === 'emergency' || r.type === 'text')
              .map(renderResourceItem)}
          </View>

          <View style={styles.resourcesSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons name="school" size={18} color={colors.info} />
              <Text style={styles.resourcesSectionTitle}>🏫 CAMPUS RESOURCES</Text>
            </View>
            {crisisResources
              .filter(r => r.type === 'campus')
              .map(renderResourceItem)}
          </View>

          <View style={styles.resourcesSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons name="people" size={18} color={colors.accent} />
              <Text style={styles.resourcesSectionTitle}>👥 COUNSELORS & ADVISORS</Text>
            </View>
            {crisisResources
              .filter(r => r.type === 'advisor')
              .map(renderResourceItem)}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed marginVertical and paddingHorizontal since parent wrapper handles spacing
  },
  emergencyAlert: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyAlertGradient: {
    padding: 12,
  },
  emergencyAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyAlertText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  borderGlow: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  urgencyIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 0.3,
  },
  expandButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  expandButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  resourcesContainer: {
    overflow: 'hidden',
  },
  resourcesList: {
    paddingTop: 16,
  },
  confidentialityBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  confidentialityGradient: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confidentialityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  resourcesSection: {
    marginBottom: 20,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resourcesSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    flex: 1,
    letterSpacing: 0.5,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  resourceCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceCardGradient: {
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 3,
  },
  resourceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  resourceNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  resourceArrow: {
    marginLeft: 8,
  },
});

export default CrisisResourcesSection; 