# SLD App - Specific Learning Disability Application

A full-stack application for students with specific learning disabilities, featuring handwriting recognition, voice-to-text, and note-taking capabilities.

## 🏗️ Architecture

```
sld/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # React Native CLI application
├── shared/           # Shared types and utilities
└── docker-compose.yml # Deployment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Development Setup

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd sld
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   npm run android  # or npm run ios
   ```

### Production Deployment

1. **Using Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Manual Deployment:**
   ```bash
   # Backend
   cd backend
   npm install
   npm run build
   npm start

   # Frontend - Build APK
   cd frontend
   npm run build:android
   ```

## 📱 Features

### ✅ Core Features
- **User Authentication** - Secure JWT-based auth
- **Note Management** - Create, edit, delete notes
- **Folder Organization** - Organize notes in folders
- **Handwriting Recognition** - Digital ink to text
- **Voice Recognition** - Speech-to-text functionality
- **Offline Support** - Works without internet

### 🎯 Learning Disability Support
- **Visual Organization** - Color-coded folders and notes
- **Voice Input** - Alternative to typing
- **Large Touch Targets** - Accessibility-friendly UI
- **Simple Navigation** - Easy-to-use interface

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate limiting

### Frontend
- **Framework:** React Native CLI
- **Navigation:** React Navigation 6
- **State Management:** React Hooks + Context
- **Storage:** AsyncStorage
- **Voice:** @react-native-voice/voice
- **HTTP Client:** Axios

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/       # Database and app configuration
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Express middleware
│   ├── controllers/  # Route controllers
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── tests/            # Test files
└── dist/             # Compiled JavaScript
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── screens/      # Screen components
│   ├── services/     # API and external services
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript type definitions
├── android/          # Android-specific code
└── ios/              # iOS-specific code
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sld_app
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
- API endpoint configured in `src/services/api.ts`
- Update `API_BASE_URL` for production

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Android APK
```bash
cd frontend
npm run build:android
# APK location: android/app/build/outputs/apk/release/
```

### iOS App
```bash
cd frontend
npm run build:ios
# Archive location: ios/SldApp.xcarchive
```

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)
```bash
docker-compose up -d
```

### 2. Cloud Deployment
- **Backend:** Deploy to Heroku, AWS, or DigitalOcean
- **Database:** MongoDB Atlas
- **Frontend:** Build APK/IPA and distribute

### 3. Local Server
- Run backend on local server
- Build mobile app with server IP

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 📱 Mobile App Features

### Voice Recognition
- Real-time speech-to-text
- Multiple language support
- Offline capability
- Error handling

### Handwriting Recognition
- Digital ink capture
- Text conversion
- Shape recognition
- Multi-page support

### Accessibility
- Large touch targets
- High contrast colors
- Voice feedback
- Simple navigation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   ```

2. **React Native Build Failed**
   ```bash
   cd frontend
   npx react-native clean
   npm install
   ```

3. **Voice Recognition Not Working**
   - Check microphone permissions
   - Verify device compatibility
   - Test with different languages

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Folders Endpoints
- `GET /api/folders` - Get user folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Notes Endpoints
- `GET /api/notes/folder/:folderId` - Get notes by folder
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search/:query` - Search notes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Check console logs for errors

## 📄 License

This project is licensed under the MIT License.