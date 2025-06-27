import React, { useState } from 'react';
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

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
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
      <TouchableOpacity 
        style={styles.header}
        activeOpacity={0.8}
        onPress={handleToggleExpanded}
      >
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="shield-checkmark" size={20} color={colors.error} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.sectionTitle}>Crisis Resources</Text>
                <Text style={styles.sectionSubtitle}>
                  {isExpanded ? 'Tap to hide resources' : 'Get help when you need it'}
                </Text>
              </View>
            </View>
            <View style={styles.expandButton}>
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
                <Ionicons name="chevron-down" size={20} color={colors.error} />
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

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
          <Text style={styles.resourcesNote}>
            🔒 All conversations are confidential. Don't hesitate to reach out.
          </Text>
          
          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesSectionTitle}>Emergency Hotlines</Text>
            {crisisResources
              .filter(r => r.type === 'emergency' || r.type === 'text')
              .map(renderResourceItem)}
          </View>

          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesSectionTitle}>Campus Resources</Text>
            {crisisResources
              .filter(r => r.type === 'campus')
              .map(renderResourceItem)}
          </View>

          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesSectionTitle}>Counselors & Advisors</Text>
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
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  headerGradient: {
    padding: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expandButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourcesContainer: {
    overflow: 'hidden',
  },
  resourcesList: {
    paddingTop: 16,
  },
  resourcesNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  resourcesSection: {
    marginBottom: 16,
  },
  resourcesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
    paddingLeft: 4,
  },
  resourceCard: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  resourceCardGradient: {
    padding: 12,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resourceNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  resourceArrow: {
    marginLeft: 8,
  },
});

export default CrisisResourcesSection; 