# BuildTrack

**Smart Construction Management Powered by AI**

A premium React Native construction management platform with a futuristic dark industrial UI — matte black, burnt orange accents, and AI-powered insights.

![BuildTrack](https://img.shields.io/badge/React%20Native-Expo%2052-blue)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | Login, signup, Firebase Auth, Builder/Admin & Supervisor roles |
| **Dashboard** | Active projects, material stock, task stats, AI insights, activity feed |
| **Materials** | Cement, steel, bricks, sand, paint, electrical — CRUD, low-stock alerts, search |
| **Tasks** | Create, assign, deadlines, progress tracking (Pending / In Progress / Completed) |
| **AI Assistant** | OpenAI-powered Q&A — inventory, delays, progress summaries, predictions |
| **Projects** | Multi-site support, photos, timeline, progress tracking |
| **Notifications** | Low stock, deadlines, AI warnings, project updates |
| **Settings** | Profile, notification toggles, theme info, logout |

---

## Quick Start (Demo Mode)

The app runs **immediately** in demo mode with sample data — no Firebase or OpenAI keys required.

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes npm)
- [Expo Go](https://expo.dev/go) on your phone, or Android Studio / Xcode for emulators

### Installation

```bash
cd BuildTrack

# Install dependencies
npm install

# Generate placeholder app icons
node scripts/generate-assets.js

# Copy environment template
copy .env.example .env

# Start the development server
npx expo start
```

Scan the QR code with **Expo Go**, or press `w` for web, `a` for Android, `i` for iOS.

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Builder / Admin | `admin@buildtrack.demo` | `demo1234` |
| Supervisor | `supervisor@buildtrack.demo` | `demo1234` |

---

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `buildtrack`
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Authentication

1. **Build** → **Authentication** → **Get started**
2. **Sign-in method** → Enable **Email/Password**

### 3. Create Firestore Database

1. **Build** → **Firestore Database** → **Create database**
2. Start in **test mode** (update rules before production)
3. Choose a region close to your users

### 4. Enable Storage

1. **Build** → **Storage** → **Get started**
2. Use default security rules for development

### 5. Register Your App

1. Project **Settings** (gear icon) → **Your apps**
2. Click **Web** (`</>`) to add a web app
3. Copy the `firebaseConfig` values

### 6. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init firestore storage

# Deploy rules from this project
firebase deploy --only firestore:rules,storage
```

Use the included `firestore.rules` and `storage.rules` files.

### 7. Update Environment Variables

Edit `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=buildtrack-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=buildtrack-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=buildtrack-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Restart Expo after changing `.env`:

```bash
npx expo start --clear
```

---

## OpenAI API Setup

### 1. Get an API Key

1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Go to **API keys** → **Create new secret key**
3. Copy the key (starts with `sk-`)

### 2. Add to Environment

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
```

### 3. Usage

The AI Assistant tab sends project context (materials, tasks, projects) to **GPT-4o-mini** for:

- Inventory questions ("How much cement is left?")
- Delayed task reports
- Progress summaries
- Material shortage predictions
- Workflow improvement suggestions

Without an API key, the app uses intelligent **demo responses** based on live app data.

> **Security note:** For production, proxy OpenAI calls through a backend (Cloud Functions) so the API key is never exposed in the client.

---

## Project Structure

```
BuildTrack/
├── App.tsx                 # Root entry, fonts, providers
├── app.json                # Expo configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── assets/                 # App icons and splash
├── scripts/
│   └── generate-assets.js  # Placeholder icon generator
└── src/
    ├── components/         # Reusable UI (Button, Card, Input, etc.)
    ├── config/             # Environment configuration
    ├── constants/          # Demo data
    ├── context/            # Auth & App state providers
    ├── navigation/         # Auth, tabs, root stack navigators
    ├── screens/            # All app screens
    ├── services/           # Firebase, OpenAI, storage
    ├── theme/              # Colors, typography, layout
    ├── types/              # TypeScript interfaces
    └── utils/              # Helpers
```

---

## Design System

| Token | Value |
|-------|-------|
| Matte Black | `#0B0B0B` |
| Charcoal Black | `#161616` |
| Steel Grey | `#2A2A2A` |
| Burnt Orange | `#FF6B00` |
| Amber Orange | `#FF8C42` |
| Soft White | `#F5F5F5` |
| Light Grey | `#B8B8B8` |
| Graphite Border | `#3A3A3A` |

**Fonts:** Poppins, Inter, Sora (loaded via `@expo-google-fonts`)

---

## Tech Stack

- **React Native** + **Expo 52**
- **TypeScript**
- **React Navigation 7** (Stack + Bottom Tabs)
- **Firebase** (Auth, Firestore, Storage)
- **OpenAI API** (GPT-4o-mini)
- **Expo Linear Gradient, Blur, Image Picker**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm` not found | Install Node.js from [nodejs.org](https://nodejs.org/) and restart terminal |
| Fonts not loading | Run `npx expo start --clear` |
| Firebase auth fails | Verify `.env` values and Email/Password is enabled |
| OpenAI errors | Check API key, billing, and network; demo mode still works |
| Missing assets | Run `node scripts/generate-assets.js` |

---

## License

MIT — Built for construction professionals.

**BuildTrack** — *Smart Construction Management Powered by AI*
