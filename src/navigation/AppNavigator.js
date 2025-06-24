import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChat';
import { colors, theme } from '../utils/colors';
import { ChatTabIcon, CameraTabIcon, StoriesTabIcon, ProfileTabIcon } from '../components/AnimatedTabIcon';

// Import screens (we'll create these next)
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EmailConfirmationScreen from '../screens/EmailConfirmationScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import StoriesScreen from '../screens/StoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon with gradient background for active state
const TabIcon = ({ name, iconType = 'Ionicons', focused, color, size }) => {
  const IconComponent = iconType === 'MaterialIcons' ? MaterialIcons : Ionicons;
  
  if (focused) {
    return (
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
      }}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.sm,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconComponent name={name} size={size} color={colors.white} />
        </LinearGradient>
      </View>
    );
  }
  
  return <IconComponent name={name} size={size} color={color} />;
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
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  const { totalUnreadCount } = useChats();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Check if we're in a chat room to completely hide the tab bar
        const routeName = route?.state?.routes[route.state.index]?.name;
        const nestedState = route?.state?.routes[route.state.index]?.state;
        const nestedRouteName = nestedState?.routes[nestedState.index]?.name;
        
        // Completely hide tab bar in ChatRoom
        const shouldHideTabBar = nestedRouteName === 'ChatRoom';
        
        return {
          headerShown: false,
          tabBarStyle: shouldHideTabBar ? { 
            display: 'none',
            position: 'absolute',
            bottom: -100, // Move completely off screen
            height: 0,
          } : {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(22, 27, 34, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 168, 232, 0.2)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 16,
            paddingBottom: Platform.OS === 'ios' ? 36 : 16,
            paddingHorizontal: 12,
            height: Platform.OS === 'ios' ? 95 : 75,
            elevation: 20,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            backdropFilter: 'blur(20px)',
          },
          tabBarActiveTintColor: colors.white,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: -4,
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
            <ChatTabIcon 
              focused={focused} 
              color={color} 
              size={focused ? 20 : size}
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
            <CameraTabIcon 
              focused={focused} 
              color={color} 
              size={focused ? 20 : size} 
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
            <StoriesTabIcon
              focused={focused} 
              color={color} 
              size={focused ? 20 : size} 
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
            <ProfileTabIcon
              focused={focused} 
              color={color} 
              size={focused ? 20 : size} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator; 