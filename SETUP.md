# SLD App Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v5.0 or higher)
3. **Expo CLI** 
4. **Android Studio** (for Android development)
5. **Xcode** (for iOS development - macOS only)

## Installation Steps

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Setup Project

1. **Install dependencies:**
   ```bash
   cd c:\sld
   npm install
   ```

2. **Setup MongoDB database:**
   ```bash
   node scripts/setup-mongodb.js
   ```

3. **Install Expo CLI globally (if not already installed):**
   ```bash
   npm install -g @expo/cli
   ```

### 3. Configure Environment

1. **Update .env file** (already configured):
   ```
   MONGODB_URI=mongodb://localhost:27017/sld_app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

2. **For production, change JWT_SECRET** to a secure random string

### 4. Run the Application

#### Development Mode:
```bash
npm start
```

#### Android:
```bash
npm run android
```

#### iOS (macOS only):
```bash
npm run ios
```

#### Web:
```bash
npm run web
```

## Features

### ✅ Fixed Features:

1. **MongoDB Database Integration**
   - User authentication with JWT
   - Notes and folders storage
   - Secure password hashing with bcrypt

2. **Enhanced Speech-to-Text**
   - Real-time voice recognition
   - Multiple language support
   - Continuous and single-shot recognition modes
   - Text-to-speech playback

3. **Local Storage**
   - All data stored in local MongoDB
   - No external dependencies
   - Offline-first approach

4. **User Authentication**
   - Secure signup/login
   - JWT-based sessions
   - Password validation

### 🎯 Key Improvements:

1. **Database Migration**: Moved from Supabase to MongoDB for local storage
2. **Voice Recognition**: Enhanced with expo-speech for TTS and improved STT
3. **Authentication**: Implemented secure local authentication with JWT
4. **Data Persistence**: All notes and folders now stored in MongoDB
5. **Error Handling**: Improved error handling throughout the app

## Troubleshooting

### MongoDB Connection Issues:
1. Ensure MongoDB service is running
2. Check if port 27017 is available
3. Verify MongoDB installation

### Voice Recognition Issues:
1. Check microphone permissions
2. Ensure device has speech recognition capabilities
3. Test with different languages

### Build Issues:
1. Clear Expo cache: `expo r -c`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. For Android: Ensure Android SDK is properly configured

## Development Notes

- The app now uses MongoDB for all data storage
- Voice recognition is enhanced with both STT and TTS capabilities
- Authentication is handled locally with JWT tokens
- All user data is stored securely in the local MongoDB instance

## Production Deployment

1. **Change JWT_SECRET** in .env to a secure random string
2. **Configure MongoDB** for production (authentication, SSL, etc.)
3. **Build the app** using EAS Build or Expo build commands
4. **Test thoroughly** on target devices

## Support

For issues or questions, check the console logs and ensure all prerequisites are properly installed and configured.