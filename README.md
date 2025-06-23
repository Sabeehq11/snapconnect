# SnapConnect - Snapchat Clone

A full-featured Snapchat clone built with React Native, Expo, and Firebase. This app includes core social features like ephemeral messaging, camera functionality, stories, and user authentication.

## 🚀 Features

### Phase 1 - Core Features (Completed)
- ✅ **User Authentication** - Login/Signup with Firebase Auth
- ✅ **Camera Integration** - Photo and video capture with Expo Camera
- ✅ **Navigation** - Bottom tab navigation with 4 main screens
- ✅ **Chat List** - View conversations with friends
- ✅ **Stories** - Horizontal story viewer
- ✅ **Profile Management** - User profile with settings
- ✅ **Real-time Database** - Firebase Firestore integration
- ✅ **Dark Theme** - Snapchat-like black and yellow UI

### Phase 2 - RAG Enhancement (Next Steps)
- 🔄 **Personalized Content Generation** - AI-generated captions based on user interests
- 🔄 **Intelligent Suggestions** - Context-aware content recommendations
- 🔄 **Smart Filters** - AI-powered photo filters
- 🔄 **Content Enhancement** - Automated content improvement

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation v6
- **Camera**: Expo Camera
- **Styling**: StyleSheet (Snapchat-inspired design)

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context (AuthContext)
├── hooks/              # Custom hooks
├── navigation/         # Navigation setup
├── screens/            # All app screens
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── CameraScreen.js
│   ├── ChatListScreen.js
│   ├── StoriesScreen.js
│   ├── ProfileScreen.js
│   └── LoadingScreen.js
└── utils/              # Utility functions
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your 'snapconnect' project
3. Click Project Settings (gear icon)
4. Add a web app if you haven't already
5. Copy the config object and replace values in `firebase.js`
6. Enable the following Firebase services:
   - **Authentication** (Email/Password)
   - **Firestore Database** (Start in test mode)
   - **Storage** (For media files)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS (Mac only)
npx expo start --ios

# Run on web
npx expo start --web
```

## 🎨 Design System

### Colors
- **Primary**: #FFFC00 (Snapchat Yellow)
- **Background**: #000000 (Black)
- **Secondary**: #333333 (Dark Gray)
- **Text**: #FFFFFF (White)
- **Accent**: #666666 (Gray)

### Screens Overview

1. **Authentication Flow**
   - Login/Signup screens with email/password
   - Automatic navigation based on auth state

2. **Main App Navigation**
   - **Chat**: Message list with friend conversations
   - **Camera**: Photo/video capture with flip camera
   - **Stories**: Horizontal story viewer
   - **Profile**: User settings and account management

## 📦 Key Components

### AuthContext
- Manages authentication state
- Provides login, signup, logout functions
- Handles user data from Firestore

### AppNavigator
- Handles navigation between auth and main app
- Tab navigation for authenticated users
- Stack navigation for auth flow

### Screens
- **CameraScreen**: Full-screen camera with capture controls
- **ChatListScreen**: Friends list with message previews
- **StoriesScreen**: Story viewer with user avatars
- **ProfileScreen**: User profile with settings menu

## 🔐 Security Features

- Firebase Authentication with email/password
- User data stored securely in Firestore
- Camera permissions handled properly
- Secure logout functionality

## 📱 Testing

1. **Install Expo Go** on your mobile device
2. **Scan QR code** from the Expo development server
3. **Test features**:
   - Create account
   - Login/logout
   - Camera functionality
   - Navigation between screens

## 🔄 Next Steps (Phase 2 - RAG Enhancement)

1. **Choose User Focus**: 
   - Content Creators
   - Social Connectors  
   - Interest Enthusiasts

2. **Implement RAG Features**:
   - OpenAI GPT-4 integration
   - Vector database for content understanding
   - Personalized content generation
   - Context-aware recommendations

3. **Add Advanced Features**:
   - Disappearing messages
   - Group chats
   - AR filters
   - Push notifications

## 🐛 Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Ensure camera permissions are enabled in device settings
   - Check app.json permissions configuration

2. **Firebase Connection Error**
   - Verify Firebase config values in firebase.js
   - Ensure Firestore and Auth are enabled in Firebase Console

3. **Navigation Issues**
   - Clear Expo cache: `npx expo start --clear`
   - Restart Metro bundler

## 🚀 Deployment

### Expo Build
```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

### Firebase Hosting (Web)
```bash
# Build web version
npx expo build:web

# Deploy to Firebase
firebase deploy
```

## 📄 License

This project is built for educational purposes as part of the RAG-powered social media app challenge.

---

**Ready to move to Phase 2?** The core Snapchat clone is complete! Next, we'll integrate RAG capabilities to make it an AI-powered social platform that surpasses traditional apps. 🎯 