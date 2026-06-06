# Mume Music Streaming App

Mume is a premium, feature-rich music streaming application built as a React Native (Expo) coding assignment. It integrates with the JioSaavn API to fetch and play songs, albums, and artists. The app features state-synchronized background playback, offline downloads, custom folder playlists, play history, theme switching, and audio quality adjustments.

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally on your machine.

### Prerequisites

Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Expo Go](https://expo.dev/client) app installed on your physical iOS/Android device, or an emulator set up.

### Installation

1. Install package dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm run start
   ```

3. Scan the QR code displayed in your terminal using the **Expo Go** app on your mobile device (or press `a` for Android Emulator / `i` for iOS Simulator).

### Code Quality Scripts

* Run linter checks:
   ```bash
   npm run lint
   ```
* Run Prettier code formatter:
   ```bash
   npm run format
   ```

---

## ⭐️ Key Features

### 1. Unified Playback Experience
*   **Persistent Mini Player**: Floating capsule card with real-time progress bar indicator, play/pause controls, and forward skipping that stays mounted across all tab views.
*   **Full Player Dashboard**: Album artwork with drop shadows, progress seek slider, skip next/prev buttons, rewind/forward 10s controls, and a slide-up synced lyrics sheet.
*   **Queue Management**: Drag-and-drop song reordering, play next priority queues, and active track indicators.
*   **Shuffle & Repeat**: Full support for playlist shuffling and cyclical repeat modes (`none`, `all`, `one`).

### 2. Personal Library & Offline Caching
*   **Custom Playlists**: Folder creation flow with custom name forms, track additions, and full playlist playback.
*   **Favorites & History**: Heart toggle actions, recently played track history trackers, and search history filters.
*   **Offline Downloader**: Uses `expo-file-system` to download and cache audio files directly to device storage. The system automatically switches playback sources from remote streaming URLs to local files when offline.

### 3. Visual Polish & UI Themes
*   **Consistently Designed Light & Dark Modes**: Instantly adapts layout styling themes across all components.
*   **Premium Borderless Cards**: Modern flat list designs with soft drop shadows instead of harsh outlines.
*   **Professional Vector Icons**: Integrated thin-stroke Feather icons in settings list panels and menu drawers.

### 4. persistent Audio Quality Selector
*   Settings options allow users to toggle streaming quality between **Standard (96 kbps)**, **High (160 kbps)**, and **Extreme (320 kbps)**. The selector persists in AsyncStorage and maps directly to API download stream bitrates.

---

## 🛠️ Architecture

```
├── App.tsx                    # App startup wrapper & AsyncStorage initializer
├── global.css                 # NativeWind styling rules
└── src/
    ├── api/                   # Axios client & JioSaavn API endpoints (quality mapping)
    ├── components/            # Reusable components (SongCard, MiniPlayer, OptionsDrawer, AudioManager)
    ├── hooks/                 # React Hooks (debouncing, query paginations)
    ├── navigation/            # Stack navigator routing configs
    ├── screens/               # Screen components (Home, Player, Queue, Search, Playlists, Favorites, Settings, Details)
    ├── store/                 # Zustand store managing global playback state
    ├── types/                 # TypeScript type schemas
    └── utils/                 # Caching downloader, AsyncStorage storage, and formatters
```

### State Management Flow
State is managed globally in **Zustand** (`src/store/playerStore.ts`), acting as the single source of truth:
*   **AsyncStorage Syncing**: State variables (theme, quality, favorites, playlists, queue, history) are saved automatically when updated, and reloaded on startup using `loadStoredMetadata`.
*   **AudioManager Loop**: Tapping play maps the chosen song details. The `AudioManager` component sits at the root, listens to Zustand store updates, updates `expo-audio` player instances, and reports playback times and completion states back to the store.

---

## ⚖️ Engineering Trade-offs

### 1. Custom Tab Navigation vs. React Navigation Navigators
*   **Approach**: We implemented a unified bottom navigation bar (`MainTabScreen.tsx`) and top sub-tabs bar (`HomeScreen.tsx`) using custom React state-driven components rather than nested navigation packages.
*   **Trade-off**: 
    *   *Pros*: Eliminates overhead, solves complex navigator lifecycle linking issues, and ensures the **MiniPlayer** remains mounted and synchronized across all views.
    *   *Cons*: Swipe gesture navigation is not native out of the box, but button presses are instant and fluid.

### 2. AsyncStorage vs. SQLite
*   **Approach**: AsyncStorage is used for serializing metadata lists.
*   **Trade-off**:
    *   *Pros*: Lightweight, requires no complex native configurations, and provides fast read/write speeds for our structured JSON arrays.
    *   *Cons*: Not optimized for complex relational search queries, but highly performant for this scope.

### 3. expo-audio vs. react-native-track-player
*   **Approach**: Used Expo's modern `expo-audio` package.
    *   *Pros*: Simplifies build setups in Expo SDK 54, plays background streams reliably, and runs cleanly in Expo Go.
    *   *Cons*: Lacks deep integration with default lock-screen notification center controls, which are typically supported by heavier packages like `react-native-track-player`.
