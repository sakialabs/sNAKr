# sNAKr Mobile App

React Native mobile app for sNAKr - shared household inventory intelligence.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Supabase Auth
- **API Client**: Axios with automatic token refresh
- **State Management**: React hooks + AsyncStorage
- **Offline Support**: Pending actions queue with sync

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
├── lib/                   # Core utilities
│   ├── api.ts            # API client
│   ├── supabase.ts       # Supabase client
│   ├── notifications.ts  # Push notifications
│   ├── offline.ts        # Offline support
│   ├── errors.ts         # Error handling
│   ├── constants.ts      # App constants
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── assets/               # Images, fonts, etc.
└── .env                  # Environment variables
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on device)
- iOS Simulator (Mac only) or Android Emulator

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Start Development Server

```bash
npm start
```

## Development

### Running on iOS
```bash
npm run ios
```

### Running on Android
```bash
npm run android
```

### Running on Web
```bash
npm run web
```

## Features

- ✅ Email/password and magic link authentication
- ✅ Inventory management with fuzzy states
- ✅ Receipt upload and processing
- ✅ Restock list with urgency grouping
- ✅ Push notifications
- ✅ Offline support with sync
- ✅ Optimistic UI updates

## Architecture

- **API Client**: Axios with automatic JWT refresh
- **Offline Support**: Pending actions queue with AsyncStorage
- **Error Handling**: User-friendly messages following sNAKr tone
- **State Management**: React hooks + local persistence

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
