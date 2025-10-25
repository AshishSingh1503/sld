# SLD App - Deployment Guide

## 🏗️ Project Structure

```
sld/
├── backend/              # Node.js + Express + MongoDB API
│   ├── src/             # TypeScript source code
│   ├── dist/            # Compiled JavaScript (after build)
│   ├── scripts/         # Database setup scripts
│   └── Dockerfile       # Docker configuration
├── frontend/            # React Native CLI application
│   ├── src/            # React Native source code
│   ├── android/        # Android-specific code
│   └── ios/            # iOS-specific code (if needed)
├── shared/             # Shared types and utilities
├── docker-compose.yml  # Multi-container deployment
├── setup.bat          # Windows setup script
└── start-dev.bat      # Windows development startup
```

## 🚀 Development Setup (Local)

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB 7.0+** - [Download](https://www.mongodb.com/try/download/community)
- **Android Studio** - [Download](https://developer.android.com/studio)
- **React Native CLI** - `npm install -g react-native-cli`

### Quick Setup (Windows)
```bash
# Run the setup script
setup.bat

# Start development servers
start-dev.bat
```

### Manual Setup
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Start MongoDB
mongod

# 3. Setup database
cd backend && npm run setup-db

# 4. Start backend (Terminal 1)
cd backend && npm run dev

# 5. Start frontend (Terminal 2)
cd frontend && npm start

# 6. Run on Android (Terminal 3)
cd frontend && npm run android
```

## 📱 Mobile App Development

### Android Setup
1. **Install Android Studio**
2. **Setup Android SDK** (API 33+)
3. **Create Android Virtual Device (AVD)**
4. **Enable Developer Options** on physical device

### Running on Android
```bash
cd frontend
npm run android
```

### Building Android APK
```bash
cd frontend
npm run build:android
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### iOS Setup (macOS only)
```bash
cd frontend/ios
pod install
cd ..
npm run ios
```

## 🐳 Production Deployment

### Docker Deployment (Recommended)
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Deployment

#### Backend Deployment
```bash
cd backend

# Install production dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Start production server
npm start
```

#### Database Setup
```bash
# MongoDB with authentication
mongod --auth --dbpath /data/db

# Create admin user
mongo admin --eval "db.createUser({user:'admin',pwd:'password',roles:['root']})"
```

## 🔧 Configuration

### Backend Environment (.env)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://admin:password@localhost:27017/sld_app?authSource=admin
JWT_SECRET=your-super-secure-jwt-secret-change-this
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration
Update `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-server-ip:3001/api';
```

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `GET http://localhost:3001/health`
- Database: `mongo --eval "db.adminCommand('ismaster')"`

### Logs
```bash
# Backend logs
cd backend && npm run logs

# Docker logs
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Backup Database
```bash
mongodump --db sld_app --out backup/
```

## 🔒 Security Checklist

### Production Security
- [ ] Change default JWT_SECRET
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates

### Mobile App Security
- [ ] Enable ProGuard (Android)
- [ ] Code obfuscation
- [ ] Certificate pinning
- [ ] Secure storage for tokens

## 🚀 Deployment Platforms

### Cloud Deployment Options

#### Backend + Database
- **Heroku** + MongoDB Atlas
- **AWS EC2** + DocumentDB
- **DigitalOcean Droplet** + MongoDB
- **Google Cloud Run** + Cloud Firestore

#### Mobile App Distribution
- **Google Play Store** (Android)
- **Apple App Store** (iOS)
- **Internal Distribution** (Enterprise)

### Example: Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create sld-app-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sld_app

# Deploy
git subtree push --prefix backend heroku main
```

## 📱 Mobile App Deployment

### Android Play Store
1. **Generate signed APK**
2. **Create Play Console account**
3. **Upload APK and metadata**
4. **Submit for review**

### iOS App Store (macOS required)
1. **Build with Xcode**
2. **Create App Store Connect account**
3. **Upload via Xcode or Application Loader**
4. **Submit for review**

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy SLD App
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Deploy to your platform
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3001
   npx kill-port 3001
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB status
   systemctl status mongod
   
   # Start MongoDB
   systemctl start mongod
   ```

3. **React Native build failed**
   ```bash
   cd frontend
   npx react-native clean
   rm -rf node_modules
   npm install
   ```

4. **Android build issues**
   ```bash
   cd frontend/android
   ./gradlew clean
   cd ..
   npm run android
   ```

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: Create GitHub issue
- **Logs**: Check console output
- **Health**: Monitor `/health` endpoint

## 🎯 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use Redis for caching
- Database indexing
- Connection pooling

### Mobile App Optimization
- Enable Hermes (Android)
- Optimize bundle size
- Lazy loading
- Image optimization

This deployment guide covers everything from local development to production deployment. The app is now structured as a proper full-stack application with separate frontend and backend, ready for deployment without relying on Expo Go.