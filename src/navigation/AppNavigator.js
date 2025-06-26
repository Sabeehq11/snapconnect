import React from 'react';
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
import CameraScreen from '../screens/CameraScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import StoriesScreen from '../screens/StoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SendToFriendsScreen from '../screens/SendToFriendsScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import DiscoverFriendsScreen from '../screens/DiscoverFriendsScreen';
import StoryPublishScreen from '../screens/StoryPublishScreen';
import CategoryStoriesScreen from '../screens/CategoryStoriesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon with modern styling
const TabIcon = ({ name, focused, color, size, hasNotifications, notificationCount }) => {
  if (focused) {
    return (
      <View style={{
        width: 56,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.sm,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={name} size={size - 2} color={colors.white} />
          {hasNotifications && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: colors.error,
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 6,
              borderWidth: 2,
              borderColor: colors.white,
            }}>
              <Text style={{
                color: colors.white,
                fontSize: 11,
                fontWeight: '600',
              }}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={name} size={size} color={color} />
      {hasNotifications && (
        <View style={{
          position: 'absolute',
          top: -6,
          right: -6,
          backgroundColor: colors.error,
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: colors.white,
            fontSize: 10,
            fontWeight: '600',
          }}>
            {notificationCount > 9 ? '9+' : notificationCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Auth Stack for login/signup
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack for profile-related screens
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="Memories" component={MemoriesScreen} />
      <Stack.Screen name="DiscoverFriends" component={DiscoverFriendsScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  const { totalUnreadCount = 0 } = useChats() || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Check if we're in a chat room to hide the tab bar
        const routeName = route?.state?.routes[route.state.index]?.name;
        const nestedState = route?.state?.routes[route.state.index]?.state;
        const nestedRouteName = nestedState?.routes[nestedState.index]?.name;
        
        // Hide tab bar in ChatRoom
        const shouldHideTabBar = nestedRouteName === 'ChatRoom';
        
        return {
          headerShown: false,
          tabBarStyle: shouldHideTabBar ? { 
            display: 'none' 
          } : {
            position: 'absolute',
            bottom: 0,
            left: 8,
            right: 8,
            backgroundColor: 'rgba(26, 26, 31, 0.95)',
            borderRadius: 16,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingHorizontal: 8,
            height: Platform.OS === 'ios' ? 70 : 56,
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          tabBarActiveTintColor: colors.white,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        };
      }}
    >
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon 
              name="chatbubbles"
              focused={focused} 
              color={color} 
              size={size}
              hasNotifications={totalUnreadCount > 0}
              notificationCount={totalUnreadCount}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon 
              name="camera"
              focused={focused} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Stories" 
        component={StoriesScreen}
        options={{
          tabBarLabel: 'Stories',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="play-circle"
              focused={focused} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="person"
              focused={focused} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator that includes both tabs and modal screens
const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="SendToFriends" 
        component={SendToFriendsScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="StoryPublish" 
        component={StoryPublishScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="CategoryStories" 
        component={CategoryStoriesScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator; 