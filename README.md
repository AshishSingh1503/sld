# SLD App - Specific Learning Disability Application

> A comprehensive full-stack application designed specifically for students with learning disabilities, featuring voice recognition, handwriting-to-text conversion, and accessible note-taking capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-blue.svg)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)

## 🏗️ Project Architecture

```
sld/
├── backend/              # Node.js + Express + MongoDB API
│   ├── src/             # TypeScript source code
│   ├── models/          # MongoDB data models
│   ├── routes/          # API endpoints
│   └── middleware/      # Authentication & validation
├── frontend/            # React Native CLI application
│   └── src/            # React Native components & services
├── SldMobile/          # React Native CLI project
│   ├── android/        # Android-specific code
│   └── App.tsx         # Main mobile app
├── web-demo.html       # Web testing interface
├── docker-compose.yml  # Production deployment
└── docs/              # Documentation files
```

## ✨ Features

### 🎯 Learning Disability Support
- **Voice-to-Text**: Speak instead of typing for easier input
- **Handwriting Recognition**: Convert digital ink to text
- **Visual Organization**: Color-coded folders and notes
- **Large Touch Targets**: Accessibility-friendly interface
- **Simple Navigation**: Intuitive, clutter-free design
- **Offline Support**: Works without internet connection

### 📱 Core Functionality
- **User Authentication**: Secure JWT-based login system
- **Note Management**: Create, edit, organize, and search notes
- **Folder System**: Categorize notes with custom colors
- **Multi-page Notes**: Add multiple pages to single notes
- **Cross-platform**: Web, Android, and iOS support

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Android Studio** (for mobile) - [Download](https://developer.android.com/studio)

### 1. Clone Repository
```bash
git clone https://github.com/AshishSingh1503/sld.git
cd sld
git checkout stage  # Use stage branch for latest features
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files with your configuration
# Set JWT_SECRET and other variables
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (if using React Native)
cd ../SldMobile
npm install
```

### 4. Start Application

#### Option A: Web Demo (Quickest)
```bash
# Terminal 1 - Start backend
cd backend
node src/server-simple.js

# Browser - Open web-demo.html
# Double-click web-demo.html or open in browser
```

#### Option B: Mobile App (Full Features)
```bash
# Terminal 1 - Backend
cd backend
node src/server-simple.js

# Terminal 2 - React Native (need Android Studio setup)
cd SldMobile
npx react-native run-android
```

#### Option C: Production (Docker)
```bash
# Copy and configure Docker environment
cp .env.docker .env
# Edit .env with your credentials

docker-compose up -d
```

## 📋 Installation Guide

### Web Demo (No Installation Required)
1. **Start Backend**: `cd backend && node src/server-simple.js`
2. **Open Browser**: Double-click `web-demo.html`
3. **Test Features**: Register, login, test API connection

### Mobile App Setup

#### Android Development
1. **Install Android Studio**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Complete setup wizard
   - Install Android SDK (API 30+)

2. **Create Virtual Device**
   - Tools → AVD Manager → Create Virtual Device
   - Select Pixel 4 → API 30 → Finish
   - Start emulator

3. **Run Mobile App**
   ```bash
   cd SldMobile
   npx react-native run-android
   ```

#### Physical Device Setup
1. **Enable Developer Options**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

2. **Connect Device**
   - Connect via USB
   - Allow USB debugging when prompted
   - Run: `npx react-native run-android`

### Production Deployment

#### Docker Deployment (Recommended)
```bash
# Configure environment
cp .env.docker .env
# Edit .env with your secrets

# Deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

#### Manual Deployment
```bash
# Backend
cd backend
npm ci --production
npm run build
npm start

# Mobile App Build
cd SldMobile
npx react-native run-android --variant=release
```

## 🛠️ Technology Stack

### Backend
| Component | Technology | Version |
|-----------|------------|----------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 4.18+ |
| Database | MongoDB | 7.0+ |
| Authentication | JWT + bcrypt | Latest |
| Validation | express-validator | 7.0+ |
| Security | Helmet, CORS, Rate limiting | Latest |

### Frontend
| Component | Technology | Version |
|-----------|------------|----------|
| Framework | React Native CLI | 0.73+ |
| Navigation | React Navigation | 6+ |
| State Management | React Hooks + Context | Built-in |
| Storage | AsyncStorage | 1.21+ |
| Voice Recognition | @react-native-voice/voice | 3.2+ |
| HTTP Client | Axios | 1.6+ |

### Development Tools
| Tool | Purpose | Version |
|------|---------|----------|
| TypeScript | Type Safety | 5.3+ |
| Docker | Containerization | Latest |
| ESLint | Code Linting | 8+ |
| Prettier | Code Formatting | Latest |

## 📁 Project Structure

```
sld/
├── 📁 backend/                    # Node.js API Server
│   ├── 📁 src/
│   │   ├── 📁 config/            # Database configuration
│   │   ├── 📁 models/            # MongoDB schemas
│   │   ├── 📁 routes/            # API endpoints
│   │   ├── 📁 middleware/        # Auth & validation
│   │   └── 📄 server.ts          # Main server file
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 .env.example          # Environment template
│   └── 📄 Dockerfile            # Container config
├── 📁 SldMobile/                 # React Native CLI App
│   ├── 📁 android/              # Android build files
│   ├── 📁 ios/                  # iOS build files (if needed)
│   ├── 📄 App.tsx               # Main app component
│   └── 📄 package.json          # Mobile dependencies
├── 📁 frontend/                  # Web Components (Legacy)
│   └── 📁 src/                  # React components
├── 📄 web-demo.html             # Standalone web demo
├── 📄 docker-compose.yml        # Production deployment
├── 📄 .env.example              # Main environment template
└── 📁 docs/                     # Documentation
    ├── 📄 ANDROID-SETUP.md      # Android development guide
    ├── 📄 DEPLOYMENT.md         # Deployment instructions
    └── 📄 USER-GUIDE.md         # User manual
```

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/sld_app
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=http://localhost:3000
```

**Docker (.env)**
```env
MONGO_USERNAME=admin
MONGO_PASSWORD=your-mongo-password
JWT_SECRET=your-jwt-secret-here
```

**Mobile App Configuration**
- API endpoint: `SldMobile/App.tsx` (line 15)
- Android: `http://10.0.2.2:3002/api` (emulator)
- iOS: `http://localhost:3002/api`
- Physical device: `http://YOUR_IP:3002/api`

## 🧪 Testing & Development

### Quick Testing (Web Demo)
```bash
# Start backend
cd backend && node src/server-simple.js

# Open web-demo.html in browser
# Test: Registration, Login, API connectivity
```

### Mobile Testing
```bash
# Check React Native setup
npx react-native doctor

# Check connected devices
adb devices

# Run on Android
cd SldMobile && npx react-native run-android
```

### API Testing
```bash
# Health check
curl http://localhost:3002/health

# Register user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 📦 Building for Production

### Android APK
```bash
cd SldMobile

# Debug build
npx react-native run-android

# Release build
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Backend Production
```bash
cd backend
npm run build        # Compile TypeScript
npm start           # Start production server
```

### Docker Production
```bash
# Build and deploy
docker-compose up -d --build

# Scale services
docker-compose up -d --scale backend=3
```

## 🚀 Deployment Options

### 1. Docker Deployment (Recommended)
```bash
# Production deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=2
```

### 2. Cloud Platforms

| Platform | Backend | Database | Mobile |
|----------|---------|----------|---------|
| **Heroku** | ✅ Easy deploy | MongoDB Atlas | APK/IPA |
| **AWS** | EC2/ECS | DocumentDB | App Store |
| **DigitalOcean** | Droplet | Managed MongoDB | Direct install |
| **Google Cloud** | Cloud Run | Firestore | Play Store |

### 3. Local Network Deployment
```bash
# Find your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update mobile app API URL
# SldMobile/App.tsx: http://YOUR_IP:3002/api

# Start backend
cd backend && npm start

# Build mobile app
cd SldMobile && npx react-native run-android
```

## 🔒 Security Features

### Authentication & Authorization
- ✅ **JWT Tokens**: Secure session management
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Rate Limiting**: Prevent brute force attacks
- ✅ **Input Validation**: express-validator sanitization

### API Security
- ✅ **CORS Protection**: Configured origins
- ✅ **Helmet.js**: Security headers
- ✅ **NoSQL Injection Prevention**: Mongoose validation
- ✅ **XSS Protection**: Input sanitization

### Data Protection
- ✅ **Environment Variables**: No hardcoded secrets
- ✅ **Local Storage**: Data stays on device
- ✅ **Encrypted Communication**: HTTPS ready
- ✅ **Secure Defaults**: Production-ready configuration

## 📱 Mobile App Features

### 🎤 Voice Recognition
- **Real-time Speech-to-Text**: Instant voice conversion
- **Multiple Languages**: English, Spanish, French, etc.
- **Offline Capability**: Works without internet
- **Error Handling**: Graceful failure recovery
- **Noise Filtering**: Clear audio processing

### ✍️ Handwriting Recognition
- **Digital Ink Capture**: Smooth drawing experience
- **Text Conversion**: Handwriting to typed text
- **Shape Recognition**: Geometric shape detection
- **Multi-page Support**: Unlimited note pages
- **Pressure Sensitivity**: Natural writing feel

### ♿ Accessibility Features
- **Large Touch Targets**: Easy interaction (44px minimum)
- **High Contrast Colors**: Better visibility
- **Voice Feedback**: Audio confirmation
- **Simple Navigation**: Intuitive interface
- **Screen Reader Support**: VoiceOver/TalkBack compatible
- **Customizable UI**: Adjustable font sizes and colors

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Kill process on port 3002
npx kill-port 3002
```

**MongoDB Connection Failed**
```bash
# Check MongoDB status (Windows)
net start MongoDB

# Check MongoDB status (Mac/Linux)
sudo systemctl start mongod
```

### Mobile App Issues

**Android Build Failed**
```bash
# Clean and rebuild
cd SldMobile/android
./gradlew clean
cd ..
npx react-native run-android
```

**Metro Bundler Issues**
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Kill Metro processes
npx kill-port 8081 8082
```

**Device Not Detected**
```bash
# Check ADB connection
adb devices

# Restart ADB
adb kill-server
adb start-server
```

### Voice Recognition Issues
- **Check Permissions**: Enable microphone access
- **Test Device**: Verify speech recognition works
- **Network**: Some features need internet
- **Language**: Ensure correct language selected

## 📄 API Documentation

### Base URL
- **Development**: `http://localhost:3002/api`
- **Android Emulator**: `http://10.0.2.2:3002/api`
- **Production**: `https://your-domain.com/api`

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | User registration | `{email, password, name, age?}` |
| POST | `/auth/login` | User login | `{email, password}` |

### Folders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/folders` | Get user folders | ✅ |
| POST | `/folders` | Create folder | ✅ |
| PUT | `/folders/:id` | Update folder | ✅ |
| DELETE | `/folders/:id` | Delete folder | ✅ |

### Notes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notes/folder/:folderId` | Get notes by folder | ✅ |
| GET | `/notes/:id` | Get single note | ✅ |
| POST | `/notes` | Create note | ✅ |
| PUT | `/notes/:id` | Update note | ✅ |
| DELETE | `/notes/:id` | Delete note | ✅ |
| GET | `/notes/search/:query` | Search notes | ✅ |

### Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Server status | `{status: 'OK', timestamp}` |

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/sld.git`
3. **Create branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** and test thoroughly
5. **Commit**: `git commit -m "feat: add your feature"`
6. **Push**: `git push origin feature/your-feature-name`
7. **Create Pull Request** to `stage` branch

### Code Standards
- **TypeScript**: Use proper typing
- **ESLint**: Follow linting rules
- **Commits**: Use conventional commit format
- **Testing**: Add tests for new features
- **Documentation**: Update README for new features

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Check `/docs` folder
- 🐛 **Issues**: [GitHub Issues](https://github.com/AshishSingh1503/sld/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AshishSingh1503/sld/discussions)
- 📧 **Email**: Create an issue for direct support

### Useful Links
- 🚀 **Live Demo**: [Web Demo](./web-demo.html)
- 📱 **Mobile Setup**: [Android Setup Guide](./docs/ANDROID-SETUP.md)
- 🐳 **Deployment**: [Deployment Guide](./docs/DEPLOYMENT.md)
- 👥 **User Guide**: [User Manual](./docs/USER-GUIDE.md)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ **Commercial use** allowed
- ✅ **Modification** allowed
- ✅ **Distribution** allowed
- ✅ **Private use** allowed
- ❌ **Liability** not provided
- ❌ **Warranty** not provided

---

<div align="center">

**Built with ❤️ for students with learning disabilities**

[⭐ Star this repo](https://github.com/AshishSingh1503/sld) • [🐛 Report Bug](https://github.com/AshishSingh1503/sld/issues) • [💡 Request Feature](https://github.com/AshishSingh1503/sld/issues)

</div>