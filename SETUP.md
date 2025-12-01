# 🚀 Eldaem App - Complete Setup Guide for Mac

## Welcome!  👋

This guide will walk you through setting up the Eldaem App step-by-step.  Don't worry if you're new to coding - just follow each step carefully. 

## 📋 Prerequisites

### 1. Install Homebrew (if not already installed)

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent. com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node. js

```bash
brew install node
```

Verify installation:

```bash
node --version
npm --version
```

You should see version numbers (e.g., v20.x.x and 10.x.x).

### 3. Install Visual Studio Code

Download from: https://code.visualstudio. com/download

Install these VS Code extensions:
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

## 🔧 Project Setup

### Step 1: Open Terminal in VS Code

1. Open Visual Studio Code
2. Press `Cmd + Shift + P`
3. Type "Terminal: Create New Terminal" and press Enter

### Step 2: Navigate to Your Project Folder

```bash
cd ~/Desktop/eldaem-app
```

### Step 3: Install Dependencies

```bash
npm install
```

This will take 3-5 minutes.  You'll see a progress bar installing packages.

## 🔥 Firebase Setup

### Step 1: Get Your Firebase Credentials

1. Go to https://console.firebase.google.com/
2. Select your existing Firebase project
3. Click the ⚙️ (gear icon) → Project Settings
4. Scroll down to "Your apps" section
5. Click "</>" (Web app icon) if you haven't created a web app yet
6. Register app with name "Eldaem App"
7.  Copy the Firebase configuration (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 2: Enable Authentication

1. In Firebase Console, click "Authentication" in left menu
2. Click "Get Started"
3. Click "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional but recommended)

### Step 3: Create Firestore Database

1. In Firebase Console, click "Firestore Database" in left menu
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location close to your users
5. Click "Enable"

### Step 4: Deploy Security Rules

1. In Firestore, click "Rules" tab
2. Copy the content from `firestore.rules` file in your project
3.  Paste it and click "Publish"

### Step 5: Create Environment File

In your project folder, create a file named `.env.local`:

```bash
touch .env.local
```

Open it in VS Code and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project. firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project. appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

⚠️ **Important**: Replace the values with YOUR actual Firebase credentials!

## 🏃‍♂️ Running the App

### Development Mode

```bash
npm run dev
```

You'll see something like:

```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to: **http://localhost:5173/**

To stop the server, press `Ctrl + C` in the terminal.

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## 📱 Testing PWA Features

### On Mac (Chrome/Edge)

1. Run `npm run dev`
2. Open Chrome
3. Go to http://localhost:5173
4. Click the install icon (➕) in the address bar
5. Click "Install"

### On iPhone

1. Build and deploy to a hosting service (see Deployment section)
2. Open Safari on iPhone
3. Go to your deployed URL
4. Tap the Share button
5.  Tap "Add to Home Screen"

## 🌐 Deployment Options

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Select your Firebase project
# Choose 'dist' as your public directory
# Configure as single-page app: Yes
# Set up automatic builds with GitHub: No

# Build your app
npm run build

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

### Option 2: Vercel (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Follow the prompts and your app will be deployed.

### Option 3: Netlify

1. Go to https://app.netlify.com/
2.  Drag and drop your `dist` folder
3. Your app is live!

## 🐛 Troubleshooting

### Issue: "command not found: npm"

**Solution**: Node.js is not installed. Follow Prerequisites Step 2.

### Issue: "EACCES: permission denied"

**Solution**: Run with proper permissions:

```bash
sudo chown -R $(whoami) ~/. npm
```

### Issue: Firebase configuration error

**Solution**: 
1. Check `. env.local` file exists
2. Verify all values are correct
3. Restart development server

### Issue: Port 5173 already in use

**Solution**: 

```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Issue: White screen after deployment

**Solution**: 
1.  Check browser console for errors (F12)
2. Verify Firebase credentials are correct
3. Check Firestore security rules are deployed

## 📞 Common Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Update dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Security Checklist

✅ `. env.local` is in `. gitignore` (never commit secrets!)
✅ Firebase Security Rules are deployed
✅ Authentication is enabled
✅ Input sanitization is implemented
✅ Use HTTPS in production

## 📚 Project Structure Overview

```
eldaem-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── contexts/       # React Context for state
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Firebase services
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── locales/        # Translations (EN/AR)
├── public/             # Static assets
└── dist/               # Production build (generated)
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#3b82f6',  // Change this
  success: '#27ae60',
  error: '#e74c3c',
}
```

### Add Translations

Edit files in `src/locales/en/` and `src/locales/ar/`

### Modify Logo

The logo is text-based ("EldaemApp").  To change it, edit `src/components/layout/Header.tsx`

## 🆘 Getting Help

If you encounter issues:

1. Check the error message in Terminal
2. Check browser console (F12 → Console tab)
3. Review this SETUP.md file
4. Check Firebase Console for errors
5. Verify `. env.local` configuration

## 🎉 Success Checklist

Before considering setup complete:

- [ ] `npm run dev` works without errors
- [ ] You can see the app in browser
- [ ] You can register a new account
- [ ] You can log in
- [ ] Firebase is receiving data (check Firestore in console)
- [ ] Language switch works (EN ↔ AR)
- [ ] App works on mobile browser

## 🚀 Next Steps

Once everything is working:

1. Create your first goal in Firebase Console
2. Test all features
3. Deploy to production
4.  Share with users! 

---

**Congratulations! ** 🎊 You've successfully set up the Eldaem App! 
```