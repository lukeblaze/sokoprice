# SokoPrice — Nairobi Business Price Comparison App

Built by Blaze Solutions Ltd. A real-time market price aggregator for IT equipment, office supplies, and consumables sourced from Nairobi vendors.

---

## Tech Stack

| Layer | Library | Purpose |
|---|---|---|
| Framework | Expo SDK 52 + Expo Router | File-based routing, Android APK builds |
| UI | React Native Paper (MD3) | Production-grade component library |
| Animations | React Native Reanimated 3 | Native-thread spring animations |
| State | Zustand | Lightweight global state |
| Data fetching | TanStack Query v5 | Caching, background refresh, retry |
| HTTP | Axios | API calls, auth interceptors |
| Charts | Victory Native + Skia | Price trend charts |
| Haptics | Expo Haptics | Touch feedback |
| Gestures | React Native Gesture Handler | Swipe, press gestures |
| Notifications | Expo Notifications | Push alerts |
| Icons | @expo/vector-icons (Ionicons) | 1,000+ icons |
| Toasts | React Native Flash Message | Success/error feedback |

---

## Project Structure

```
sokoprice/
├── app/
│   ├── _layout.tsx              # Root providers (Paper, Query, GestureHandler)
│   ├── tabs/
│   │   ├── _layout.tsx          # Bottom tab navigation
│   │   ├── index.tsx            # Home — market feed + ticker
│   │   ├── search.tsx           # Search with category filters
│   │   ├── vendors.tsx          # Vendor directory
│   │   ├── alerts.tsx           # Price alerts + notifications
│   │   └── profile.tsx          # User profile + settings
│   ├── product/[id].tsx         # Product detail + vendor comparison
│   └── vendor/[id].tsx          # Vendor detail + contact
│
├── src/
│   ├── api/index.ts             # Axios instance + all API calls (mock-ready)
│   ├── components/
│   │   ├── common/index.tsx     # Badge, Tag, Avatar, EmptyState, Skeleton
│   │   ├── home/
│   │   │   ├── ProductCard.tsx  # Vertical + horizontal product card
│   │   │   └── PriceTicker.tsx  # Scrolling live price ticker
│   │   └── vendors/
│   │       └── VendorCard.tsx   # Vendor card with rating + badge
│   ├── hooks/useQueries.ts      # All TanStack Query hooks
│   ├── store/index.ts           # Zustand store (watchlist, alerts, notifications)
│   ├── theme/
│   │   ├── tokens.ts            # Navy/amber color tokens, spacing, typography
│   │   └── index.ts             # React Native Paper theme + dark mode
│   ├── types/index.ts           # All TypeScript interfaces
│   └── utils/
│       ├── mockData.ts          # Realistic Nairobi vendor + product data
│       └── format.ts            # KES formatting, date helpers, price utils
```

---

## Quick Start

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- Expo Go app on your Android phone OR Android Studio with an emulator

### 1. Install dependencies

```bash
cd sokoprice
npm install
```

### 2. Install Google Fonts packages

```bash
npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/inter
```

### 3. Run on your phone (fastest)

```bash
npx expo start
```
Scan the QR code with Expo Go on your Android phone.

### 4. Run on Android emulator

```bash
npx expo start --android
```

---

## Building the Android APK

### One-time EAS setup
```bash
eas login          # login with your Expo account
eas build:configure
```

### Build a preview APK (installable on any Android)
```bash
npm run build:preview
```
EAS builds it in the cloud — no local Android SDK needed. Download link emailed when done (~10 min).

### Build production AAB (for Google Play)
```bash
npm run build:android
```

---

## Connecting to Your Django Backend

1. Set your API URL in `.env`:
```
EXPO_PUBLIC_API_URL=https://your-django-backend.onrender.com/api/v1
```

2. The API layer is in `src/api/index.ts`. Mock data is already wired — replace the `await delay()` stubs with real `api.get()` calls once your Django endpoints are ready.

3. Required Django endpoints:
```
GET  /api/v1/products/          # list all products
GET  /api/v1/products/:id/      # product detail
GET  /api/v1/products/:id/trend/ # price history
GET  /api/v1/products/:id/vendors/ # vendor listings
GET  /api/v1/vendors/           # list all vendors
GET  /api/v1/vendors/:id/       # vendor detail
GET  /api/v1/market/summary/    # market stats
GET  /api/v1/market/ticker/     # ticker items
```

---

## Features

- Live price ticker strip (scrolling, animated)
- Product listing with price + % change
- Vendor comparison with price bars
- Set price alerts (notify when price drops below target)
- Watchlist (save products)
- Save vendors
- WhatsApp and call vendor direct from app
- Notification center
- Profile + settings
- Dark mode ready (Paper MD3 theme)
- TypeScript throughout
- Clean architecture: API / hooks / store / components fully separated

---

## Next Steps After Launch

1. Wire Django REST API replacing mock data
2. Add Africa's Talking SMS for price alert notifications  
3. Add vendor onboarding flow (vendor can submit their own prices)
4. Add map view (Google Maps SDK) to show vendor locations
5. Publish to Google Play via EAS Submit
