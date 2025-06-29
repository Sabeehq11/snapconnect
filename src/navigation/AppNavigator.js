import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Platform, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import { colors, theme } from '../utils/colors';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EmailConfirmationScreen from '../screens/EmailConfirmationScreen';
import LoadingScreen from '../screens/LoadingScreen';
import StoriesScreen from '../screens/StoriesScreen';
import CategoryStoriesScreen from '../screens/CategoryStoriesScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import SendToFriendsScreen from '../screens/SendToFriendsScreen';
import StoryPublishScreen from '../screens/StoryPublishScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import TutorialScreen from '../screens/TutorialScreen';
import AIChatScreen from '../screens/AIChatScreen';
import DiscoverFriendsScreen from '../screens/DiscoverFriendsScreen';

// Import components
import TutorialFloatingButton from '../components/TutorialFloatingButton';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator with enhanced styling
const MainTabs = () => {
  const { unreadCount } = useChats();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 75 : 60,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Stories') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={iconName} 
                size={focused ? 28 : 24} 
                color={focused ? colors.primary : colors.textSecondary} 
              />
              {route.name === 'Chats' && unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -5,
                  right: -10,
                  backgroundColor: colors.danger,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: colors.surface,
                }}>
                  <Text style={{
                    color: colors.white,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Stories" component={StoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator that includes both tabs and individual screens
const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial automatically when user logs in
  useEffect(() => {
    if (user && !loading) {
      setShowTutorial(true);
    }
  }, [user, loading]);

  const handleTutorialPress = () => {
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ChatRoom" component={ChatScreen} />
            <Stack.Screen name="CategoryStories" component={CategoryStoriesScreen} />
            <Stack.Screen name="SendToFriends" component={SendToFriendsScreen} />
            <Stack.Screen name="StoryPublish" component={StoryPublishScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
            <Stack.Screen name="Memories" component={MemoriesScreen} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="DiscoverFriends" component={DiscoverFriendsScreen} />
            <Stack.Screen 
              name="Tutorial" 
              component={TutorialScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
          </>
        )}
      </Stack.Navigator>
      
      {user && (
        <TutorialFloatingButton onPress={handleTutorialPress} />
      )}

      {showTutorial && (
        <TutorialScreen 
          visible={showTutorial} 
          onComplete={handleTutorialComplete} 
        />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 