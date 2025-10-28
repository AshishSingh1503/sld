# Android Developer Options & USB Debugging Setup

## 📱 Enable Developer Options

### **Step 1: Find Build Number**
1. Open **Settings** on your Android phone
2. Scroll down and tap **About phone** (or **About device**)
3. Look for **Build number** (might be under **Software information**)
4. **Tap Build number 7 times rapidly**
5. You'll see message: "You are now a developer!"

### **Step 2: Access Developer Options**
1. Go back to main **Settings**
2. Look for **Developer options** (usually near bottom)
3. If not visible, check under **System** → **Advanced** → **Developer options**

## 🔧 Enable USB Debugging

### **Step 3: Turn On USB Debugging**
1. Open **Developer options**
2. Toggle **Developer options** to **ON** (if not already)
3. Scroll down to find **USB debugging**
4. Toggle **USB debugging** to **ON**
5. Tap **OK** when prompted

### **Step 4: Additional Settings (Recommended)**
In Developer options, also enable:
- **Stay awake** (screen won't sleep when charging)
- **USB debugging (Security settings)** (if available)
- **Install via USB** (allows app installation)

## 🔌 Connect to Computer

### **Step 5: Connect Phone**
1. Use **USB cable** to connect phone to computer
2. On phone, you'll see notification: **"USB for file transfer"**
3. Tap notification and select **"File Transfer"** or **"MTP"**

### **Step 6: Authorize Computer**
1. Phone will show popup: **"Allow USB debugging?"**
2. Check **"Always allow from this computer"**
3. Tap **OK**

### **Step 7: Verify Connection**
Open terminal and run:
```bash
cd frontend
npx react-native run-android --deviceId
```

## 📋 Device-Specific Instructions

### **Samsung Phones**
- Settings → About phone → Software information → Build number (tap 7 times)
- Settings → Developer options → USB debugging

### **Xiaomi/MIUI**
- Settings → About phone → MIUI version (tap 7 times)
- Settings → Additional settings → Developer options → USB debugging

### **OnePlus**
- Settings → About phone → Build number (tap 7 times)
- Settings → System → Developer options → USB debugging

### **Huawei**
- Settings → About phone → Build number (tap 7 times)
- Settings → System & updates → Developer options → USB debugging

### **Google Pixel**
- Settings → About phone → Build number (tap 7 times)
- Settings → System → Advanced → Developer options → USB debugging

## ⚠️ Troubleshooting

### **Developer Options Not Appearing**
- Try restarting phone after tapping build number
- Look under **System** → **Advanced**
- Some phones: **Settings** → **System** → **About phone**

### **USB Debugging Grayed Out**
- Make sure **Developer options** toggle is ON
- Restart phone and try again
- Check if phone is locked (unlock first)

### **Computer Not Recognizing Phone**
- Try different USB cable
- Try different USB port
- Install phone manufacturer's USB drivers
- Enable **File Transfer** mode on phone

### **ADB Not Working**
```bash
# Check if device is detected
adb devices

# If no devices, try:
adb kill-server
adb start-server
adb devices
```

## 🚀 Run Your App

Once setup is complete:
```bash
cd frontend
npx react-native run-android
```

Your SLD app will install and launch on your phone!

## 🔒 Security Note
- **Disable USB debugging** when not developing
- Only allow trusted computers
- Developer options can be turned off anytime