import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const SchoolEventsCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadSchoolEvents();
  }, []);

  const loadSchoolEvents = () => {
    // Mock school events data - realistic for college students
    const upcomingEvents = [
      {
        id: 'event-1',
        title: 'Midterm Week',
        date: new Date(2024, 11, 16), // December 16, 2024
        type: 'academic',
        description: 'Final exams for fall semester',
        icon: '📚',
        color: colors.warning,
        time: 'All Day',
        location: 'Various Locations'
      },
      {
        id: 'event-2',
        title: 'Winter Break Begins',
        date: new Date(2024, 11, 20), // December 20, 2024
        type: 'holiday',
        description: 'Campus closes for winter break',
        icon: '❄️',
        color: colors.info,
        time: '5:00 PM',
        location: 'Campus-wide'
      },
      {
        id: 'event-3',
        title: 'Basketball vs. State',
        date: new Date(2024, 11, 14), // December 14, 2024
        type: 'sports',
        description: 'Home game against State University',
        icon: '🏀',
        color: colors.secondary,
        time: '7:00 PM',
        location: 'Athletic Center'
      },
      {
        id: 'event-4',
        title: 'Club Fair',
        date: new Date(2024, 11, 12), // December 12, 2024
        type: 'social',
        description: 'Discover new clubs and organizations',
        icon: '🎪',
        color: colors.accent,
        time: '11:00 AM - 3:00 PM',
        location: 'Student Union'
      },
      {
        id: 'event-5',
        title: 'Study Group Sessions',
        date: new Date(2024, 11, 15), // December 15, 2024
        type: 'academic',
        description: 'Free tutoring and study groups',
        icon: '👥',
        color: colors.primary,
        time: '2:00 PM - 8:00 PM',
        location: 'Library - Group Study Rooms'
      },
      {
        id: 'event-6',
        title: 'Career Fair',
        date: new Date(2024, 11, 18), // December 18, 2024
        type: 'career',
        description: 'Meet with potential employers',
        icon: '💼',
        color: colors.success,
        time: '10:00 AM - 4:00 PM',
        location: 'Convention Center'
      },
      {
        id: 'event-7',
        title: 'Holiday Party',
        date: new Date(2024, 11, 19), // December 19, 2024
        type: 'social',
        description: 'End of semester celebration',
        icon: '🎉',
        color: colors.pink,
        time: '8:00 PM',
        location: 'Student Union Ballroom'
      }
    ];

    setEvents(upcomingEvents);
  };

  const formatDate = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7 && diffDays > 0) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEventPress = (event) => {
    Alert.alert(
      event.title,
      `${event.description}\n\nWhen: ${formatDate(event.date)} at ${event.time}\nWhere: ${event.location}`,
      [
        { text: 'Set Reminder', onPress: () => console.log('Reminder set for', event.title) },
        { text: 'Share Event', onPress: () => console.log('Sharing', event.title) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5); // Show next 5 events
  };

  const renderEventItem = (event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      activeOpacity={0.8}
      onPress={() => handleEventPress(event)}
    >
      <LinearGradient
        colors={[`${event.color}15`, `${event.color}08`]}
        style={styles.eventCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.eventHeader}>
          <View style={[styles.eventIcon, { backgroundColor: event.color }]}>
            <Text style={styles.eventIconText}>{event.icon}</Text>
          </View>
          <View style={styles.eventDate}>
            <Text style={styles.eventDateText}>{formatDate(event.date)}</Text>
            <Text style={styles.eventTimeText}>{event.time}</Text>
          </View>
        </View>
        
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
          <View style={styles.eventFooter}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.eventLocation} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: `${event.color}20` }]}>
              <Text style={[styles.typeText, { color: event.color }]}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>School Events</Text>
          <Text style={styles.sectionSubtitle}>Stay updated with campus life</Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.calendarButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="calendar" size={20} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <View style={styles.eventsContainer}>
                {getUpcomingEvents().slice(0, 3).map(renderEventItem)}
        
        {getUpcomingEvents().length > 3 && (
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View {getUpcomingEvents().length - 3} more events</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        {getUpcomingEvents().length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No upcoming events</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 12,
  },
  calendarButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsContainer: {
    maxHeight: 300,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 6,
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  eventCardGradient: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIconText: {
    fontSize: 16,
  },
  eventDate: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  eventTimeText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  eventContent: {
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default SchoolEventsCalendar; 