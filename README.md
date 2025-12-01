# 🎯 Eldaem App

A Progressive Web App (PWA) for goal tracking and community engagement with bilingual support (English/Arabic).

## ✨ Features

- 🎯 Goal tracking with daily voting
- 👥 Community engagement and reflections
- 💬 Questions and community discussions
- 🌍 Bilingual support (English & Arabic)
- 📱 Progressive Web App (PWA) - works offline
- 🔒 Secure authentication with Firebase
- 🎨 Modern, responsive UI with Tailwind CSS
- ♿ Accessible and user-friendly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- Visual Studio Code (recommended)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd eldaem-app

# Install dependencies
npm install

# Create environment file
cp .env.example . env. local
# Edit .env.local with your Firebase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser. 

## 📖 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions, especially if you're new to development.

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Firebase (Auth, Firestore)
- **PWA**: Vite PWA Plugin + Workbox
- **Icons**: Lucide React
- **i18n**: react-i18next

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── services/       # Firebase and API services
├── utils/          # Helper functions
├── types/          # TypeScript type definitions
└── locales/        # Translation files (EN/AR)
```

## 🔐 Security

- Firebase Security Rules configured
- Input sanitization with DOMPurify
- XSS and CSRF protection
- Environment variables for sensitive data
- Authenticated API requests only

## 🌐 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Other Platforms

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist` folder

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit the deployed URL
2. Click install icon in address bar
3. Click "Install"

### Mobile (Safari/Chrome)
1. Visit the deployed URL
2.  Tap Share/Menu button
3.  Tap "Add to Home Screen"

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🌍 Internationalization

The app supports English and Arabic with full RTL support. 

To add/edit translations, modify:
- `src/locales/en/translation.json`
- `src/locales/ar/translation.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues and questions:
1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Review Firebase Console for errors
3. Check browser console (F12)
4. Open an issue on GitHub

## 🎉 Acknowledgments

Built with ❤️ using modern web technologies. 

---

**Made with React + TypeScript + Firebase**
```