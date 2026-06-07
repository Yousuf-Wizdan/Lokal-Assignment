# 🎵 Music Player — React Native

A fully-featured music streaming app built with **React Native (Expo)** for the Lokal React Native Intern Assignment. Streams songs, artists, and albums from the JioSaavn API with offline download support, playlist management, and a polished player UI.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Screens & Navigation](#screens--navigation)
- [State Management](#state-management)
- [Audio Playback](#audio-playback)
- [Offline Downloads](#offline-downloads)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Known Limitations](#known-limitations)

---

## ✨ Features

| Category | Features |
|---|---|
| **Playback** | Play, Pause, Seek, Next, Previous, Stop |
| **Modes** | Shuffle, Repeat (None / All / One), Variable Playback Speed |
| **Queue** | Add to queue, Remove from queue, Drag-to-reorder |
| **Library** | Favorites, Custom Playlists, Recently Played, Play Count tracking |
| **Search** | Search Songs, Artists, Albums; Recent search history |
| **Downloads** | Download songs for offline playback, auto-verify file existence on load |
| **Audio Quality** | Standard / High / Extreme quality selection (maps to JioSaavn CDN bitrates) |
| **UI** | Light/Dark theme, Mini Player, Full-screen Player, persistent bottom tab bar |

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | React Native 0.81 + Expo 54 | Cross-platform, fast iteration, large ecosystem |
| **Language** | TypeScript 5.9 | Type-safety, better DX, catches bugs at compile time |
| **Navigation** | React Navigation 7 (Native Stack + custom Tab) | Native-feel transitions, typed route params |
| **State Management** | Zustand 5 | Minimal boilerplate, fine-grained subscriptions, easy to test |
| **Server State / Caching** | TanStack React Query 5 | Automatic caching, background refetch, deduplication |
| **HTTP Client** | Axios | Interceptors, timeout config, cleaner API than `fetch` |
| **Audio Engine** | `expo-audio` | First-class Expo support, background playback, silent mode |
| **File System** | `expo-file-system` | Download to device, persist local URIs, delete files |
| **Persistence** | AsyncStorage | Lightweight KV store for queue, favorites, playlists, metadata |
| **Styling** | NativeWind (Tailwind CSS) | Utility-first, consistent design tokens, no StyleSheet boilerplate |
| **Animations** | React Native Reanimated 4 + Gesture Handler | Smooth 60fps animations on the UI thread |
| **Drag & Drop** | `react-native-draggable-flatlist` | Reorderable queue with haptic-ready gestures |
| **Icons** | `@expo/vector-icons` (Ionicons) | 1000+ built-in icons, matches design consistently |

**API:** [JioSaavn Unofficial API](https://saavn.sumit.co/api) — `/search/songs`, `/search/artists`, `/search/albums`, `/artists/:id`, `/albums`

---

## 🏗️ Project Architecture

```
music-player/
├── App.tsx                     # Root: providers setup (GestureHandler, SafeArea, QueryClient, Nav)
├── global.css                  # NativeWind base styles
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance with base URL & timeout
│   │   └── songs.ts            # API functions: searchSongs, searchArtists, searchAlbums,
│   │                           # getArtistSongs, getAlbumSongs + mapSong() normaliser
│   ├── components/
│   │   ├── AudioManager.tsx    # Headless audio engine — bridges expo-audio ↔ Zustand store
│   │   ├── MiniPlayer.tsx      # Persistent mini player bar shown above the tab bar
│   │   ├── SongCard.tsx        # Reusable song list item with artwork + actions
│   │   └── SongOptionsDrawer.tsx # Bottom sheet with per-song actions (queue, download, playlist, favourite)
│   ├── hooks/
│   │   ├── useAudioPlayer.ts   # Re-export of expo-audio's useAudioPlayer
│   │   ├── useDebounce.ts      # Generic debounce hook used in Search
│   │   ├── usePlayerController.ts # Thin hook exposing common player actions from the store
│   │   └── useSongs.ts         # React Query hook for fetching trending/home songs
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Root Stack: Main → Player | Queue | ArtistDetail | AlbumDetail | Search
│   ├── screens/
│   │   ├── MainTabScreen.tsx   # Custom bottom tab (Home | Favorites | Playlists | Settings)
│   │   ├── HomeScreen.tsx      # Trending songs, recently played, top artists/albums sections
│   │   ├── SearchScreen.tsx    # Multi-tab search (Songs / Artists / Albums), debounced input
│   │   ├── PlayerScreen.tsx    # Full-screen player: artwork, scrubber, controls, speed, queue button
│   │   ├── QueueScreen.tsx     # Draggable queue list with remove & reorder
│   │   ├── FavoritesScreen.tsx # Persisted favourites list
│   │   ├── PlaylistsScreen.tsx # Create / delete playlists, add/remove songs
│   │   ├── SettingsScreen.tsx  # Theme toggle, audio quality, playback speed, storage info
│   │   ├── ArtistDetailScreen.tsx # Artist songs fetched by ID
│   │   └── AlbumDetailScreen.tsx  # Album songs fetched by ID
│   ├── store/
│   │   └── playerStore.ts      # Single Zustand store — all playback, library & settings state
│   ├── types/
│   │   ├── song.ts             # Song, Artist, Album interfaces
│   │   └── navigation.ts       # Typed RootStackParamList for React Navigation
│   └── utils/
│       ├── downloads.ts        # File download, delete, path resolution via expo-file-system
│       ├── formatTime.ts       # mm:ss formatter for player scrubber
│       └── storage.ts          # AsyncStorage helpers: queue, favorites, playlists, history, settings
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  GestureHandlerRootView > SafeAreaProvider >            │
│  QueryClientProvider > NavigationContainer              │
│         └── <AudioManager />  (headless)                │
│         └── <AppContent />    (screens)                 │
└─────────────────────────────────────────────────────────┘
           │                         │
           ▼                         ▼
   ┌───────────────┐        ┌─────────────────┐
   │  expo-audio   │◄──────►│  Zustand Store  │
   │  (AudioPlayer)│        │  (playerStore)  │
   └───────────────┘        └─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌──────────┐   ┌──────────┐   ┌──────────────┐
             │AsyncStore│   │React     │   │expo-file-    │
             │(persist) │   │Query API │   │system (DL)   │
             └──────────┘   └──────────┘   └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android emulator) OR a physical device with the **Expo Go** app

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd music-player

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npm start
```

### Running on a Device / Emulator

```bash
# Android emulator or connected device
npm run android

# iOS simulator (macOS only)
npm run ios

# Expo Go (scan QR code — note: expo-audio background mode may be limited)
npm start
```

> **Note:** Background audio and file downloads work best on a **development build** (`expo run:android` / `expo run:ios`) rather than the Expo Go sandbox, because `expo-audio` uses native modules that require a full native build for full functionality.

### Prebuild (Native Code Generation)

```bash
# Generate native android/ and ios/ directories
npm run prebuild
```

---

## 📱 Screens & Navigation

```
AppNavigator (Native Stack)
├── Main (MainTabScreen — custom bottom tabs)
│   ├── Home          — Trending songs, recently played, artists & albums discovery
│   ├── Favorites     — Persisted liked songs
│   ├── Playlists     — User-created playlists with song management
│   └── Settings      — Theme, audio quality, playback speed, storage
├── Player            — Full-screen player with artwork, seek bar & controls
├── Queue             — Drag-to-reorder playback queue
├── Search            — Tabbed search: Songs | Artists | Albums
├── ArtistDetail      — Artist profile + songs list
└── AlbumDetail       — Album info + tracklist
```

A **MiniPlayer** sits persistently above the bottom tab bar whenever a song is active, giving the user quick play/pause and navigation to the full player from any screen.

---

## 🗃️ State Management

All application state lives in a single **Zustand store** ([`src/store/playerStore.ts`](./src/store/playerStore.ts)).

### Store Slices

| Slice | Key State |
|---|---|
| **Playback** | `currentSong`, `queue`, `currentIndex`, `isPlaying`, `position`, `duration` |
| **Modes** | `isShuffle`, `repeatMode`, `playbackSpeed`, `audioQuality` |
| **Library** | `favorites`, `recentlyPlayed`, `recentSearches`, `playCounts` |
| **Playlists** | `playlists` (Record\<name, Song[]>) |
| **Downloads** | `downloadedSongs`, `isDownloadingSongs` |
| **UI** | `theme` (light/dark) |

### PlayerApi Bridge

`AudioManager` registers a **`playerApi`** object into the store on mount. This decouples the Zustand store (plain JS, no React) from the `expo-audio` hooks (which must live inside a component). The store calls `playerApi.playSong()`, `.pause()`, `.seek()` etc., and `AudioManager` fulfils them using the actual audio player instance.

---

## 🔊 Audio Playback

[`AudioManager.tsx`](./src/components/AudioManager.tsx) is a **render-less component** (returns `null`) mounted at the app root. It:

1. Calls `setAudioModeAsync({ shouldPlayInBackground: true, playsInSilentMode: true })` on mount so audio continues when the app is backgrounded or the phone is silenced.
2. Subscribes to `useAudioPlayerStatus` and syncs `position`, `duration`, and `isPlaying` into the Zustand store.
3. Fires `nextSong()` on `status.didJustFinish` to advance the queue automatically.
4. Resolves the audio URL — if a song has been downloaded, the **local file URI** is used instead of the remote URL, enabling offline playback.

---

## 📥 Offline Downloads

Downloads are managed through [`src/utils/downloads.ts`](./src/utils/downloads.ts):

1. **Download:** `expo-file-system.downloadAsync` saves the audio file to `documentDirectory/music-player-downloads/<songId>.<ext>`.
2. **Persistence:** A `DownloadRecord` (`{ localUri, downloadedAt }`) is stored in AsyncStorage keyed by `songId`.
3. **Integrity Check:** On app launch, `loadDownloadedSongs()` verifies each stored `localUri` still exists on disk — stale records are silently pruned.
4. **Playback:** `AudioManager` checks `downloadedSongs[currentSong.id]?.localUri` and prefers it over the remote URL.
5. **Deletion:** `deleteDownloadedSongFile` removes the file from the filesystem and the record from AsyncStorage.

---

## ⚖️ Design Decisions & Trade-offs

### 1. Zustand over Redux / Context API
**Decision:** A single flat Zustand store rather than Redux Toolkit or React Context.  
**Why:** Zustand has near-zero boilerplate, allows fine-grained per-slice subscriptions (components re-render only when their selected slice changes), and is trivially testable as plain JS functions. For an app of this scope, Redux's extra layers (actions, reducers, selectors, thunks) would be over-engineering.  
**Trade-off:** As the app grows, a single store file becomes unwieldy. A future refactor would split it into domain slices using Zustand's `combine` or middleware patterns.

### 2. Headless `AudioManager` Component vs. a Custom Hook
**Decision:** Audio logic lives in a render-less `<AudioManager />` component mounted at root, not in a custom hook called per-screen.  
**Why:** `expo-audio`'s `useAudioPlayer` ties the player instance lifecycle to the component that calls it. By hoisting it to the app root, the player survives navigation between screens. Calling it inside individual screens would destroy and recreate the player on every navigation, causing audio to cut out.  
**Trade-off:** The `playerApi` bridge pattern (registering imperative methods into the store) is slightly unconventional. A cleaner alternative would be a React Context holding the player ref, but Zustand's global accessibility made the bridge simpler to use from anywhere.

### 3. Custom Tab Bar instead of `@react-navigation/bottom-tabs`
**Decision:** The bottom tab bar is a hand-rolled `Pressable`-based component inside `MainTabScreen`.  
**Why:** This gives full control over the layout — specifically placing the `MiniPlayer` *above* the tab bar without fighting the library's API. The `@react-navigation/bottom-tabs` library makes inserting content between the screen and the tab bar difficult without custom `tabBarBackground` hacks.  
**Trade-off:** Loses automatic deep-linking and `initialRouteName` behaviour that the library provides. Each tab renders its screen by swapping components rather than truly mounting/unmounting separate navigators, so tab state is not preserved when switching (e.g. scroll position resets). This could be solved with a stack-per-tab pattern if needed.

### 4. TanStack React Query for Server State
**Decision:** API calls go through React Query hooks, not raw `useEffect` + `useState`.  
**Why:** React Query handles caching, background refetching, deduplication of in-flight requests, and loading/error states declaratively. The search screen benefits directly: repeated searches for the same query are served from cache without extra network requests.  
**Trade-off:** Adds a dependency and a small conceptual overhead. For a very simple read-only API, raw `fetch` + `useState` could suffice, but React Query pays dividends immediately with the search debounce + pagination pattern.

### 5. NativeWind (Tailwind CSS) for Styling
**Decision:** All styles are written as Tailwind utility classes via NativeWind instead of `StyleSheet.create`.  
**Why:** Consistent spacing/colour tokens across the app, no context switching between JSX and style objects, and dark mode is trivially handled by toggling a `isDark` boolean and switching class variants.  
**Trade-off:** NativeWind v4 (used here) is still maturing and some Tailwind classes are not yet supported. Dynamic class names (e.g. string-interpolated colour values) are sometimes unreliable and require `style` props as an escape hatch, which was occasionally needed for the theme's accent colour (`#ff8216`).

### 6. Audio Quality Mapped at Fetch Time
**Decision:** The `audioQuality` setting (`standard` / `high` / `extreme`) selects a different index from JioSaavn's `downloadUrl` array when songs are mapped, rather than re-fetching on quality change.  
**Why:** Simple and immediate — no extra API call needed.  
**Trade-off:** The quality only applies to songs fetched *after* the setting changes. Songs already in the queue/cache use the URL resolved at fetch time. A proper solution would re-fetch or store all URL variants per song and resolve at play time.

---

## ⚠️ Known Limitations

- **iOS background audio**: Fully functional on a development build. Expo Go on iOS restricts background audio APIs.
- **Lyrics**: Not implemented — the JioSaavn API endpoint for lyrics requires additional authentication.
- **Pagination in Queue**: The queue has no upper bound; very large queues could impact memory.
- **No tests**: Unit and integration tests are not included in this submission but would be the natural next step (Zustand stores are easy to unit-test in isolation).
- **Audio quality re-resolution**: Quality setting only affects newly fetched songs, not songs already in the queue (see Trade-offs §6).
