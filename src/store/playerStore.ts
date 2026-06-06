import { create } from 'zustand';
import { Song } from '../types/song';
import {
  saveQueue,
  loadQueue,
  saveFavorites,
  loadFavorites,
  savePlaylists,
  loadPlaylists,
  saveHistory,
  loadHistory,
  saveSearches,
  loadSearches,
  saveTheme,
  loadTheme,
  savePlayCounts,
  loadPlayCounts,
  saveAudioQuality,
  loadAudioQuality,
} from '../utils/storage';
import {
  deleteDownloadedSongFile,
  downloadSongFile,
  loadDownloadedSongs,
  saveDownloadedSongs,
  DownloadRecord,
} from '../utils/downloads';

type PlayerApi = {
  playSong: (song: Song) => Promise<void> | void;
  pause: () => Promise<void> | void;
  resume: () => Promise<void> | void;
  seek: (ms: number) => Promise<void> | void;
  stop: () => Promise<void> | void;
  setSpeed: (rate: number) => Promise<void> | void;
} | null;

interface PlayerStore {
  // Playback State
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  playerApi: PlayerApi;

  // Custom Player Modes
  theme: 'light' | 'dark';
  audioQuality: 'standard' | 'high' | 'extreme';
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';

  
  favorites: Record<string, Song>;
  recentlyPlayed: Song[];
  recentSearches: string[];
  playlists: Record<string, Song[]>;
  playCounts: Record<string, number>;
  playbackSpeed: number;

  // Download States
  downloadedSongs: Record<string, DownloadRecord>;
  isDownloadingSongs: Record<string, boolean>;

  
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (value: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;

  
  nextSong: () => void;
  previousSong: () => void;
  playSong: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  seek: (ms: number) => void;
  stop: () => void;
  removeFromQueue: (songId: string) => void;
  reorderQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => boolean;

  // API Registration
  registerPlayerApi: (api: PlayerApi) => void;
  unregisterPlayerApi: () => void;

  // Mode Actions
  toggleTheme: () => void;
  setAudioQuality: (quality: 'standard' | 'high' | 'extreme') => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaybackSpeed: (speed: number) => void;

  // Library Actions
  toggleFavorite: (song: Song) => void;
  addRecentlyPlayed: (song: Song) => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  incrementPlayCount: (songId: string) => void;

  // Playlist Actions
  createPlaylist: (name: string) => void;
  deletePlaylist: (name: string) => void;
  addSongToPlaylist: (name: string, song: Song) => void;
  removeSongFromPlaylist: (name: string, songId: string) => void;

  // Storage Operations
  loadStoredQueue: () => Promise<void>;
  loadStoredDownloads: () => Promise<void>;
  loadStoredMetadata: () => Promise<void>;

  // Download Actions
  downloadSong: (song: Song) => Promise<void>;
  removeDownloadedSong: (songId: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial States
  currentSong: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  position: 0,
  duration: 0,
  playerApi: null,

  theme: 'light',
  audioQuality: 'extreme',
  isShuffle: false,
  repeatMode: 'none',

  favorites: {},
  recentlyPlayed: [],
  recentSearches: [],
  playlists: {},
  playCounts: {},
  playbackSpeed: 1.0,

  downloadedSongs: {},
  isDownloadingSongs: {},

  // Basic State Setters
  setCurrentSong: (song) => set({ currentSong: song }),
  setQueue: (songs) => {
    saveQueue(songs);
    set({ queue: songs });
  },
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setIsPlaying: (value) => set({ isPlaying: value }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),

  
  nextSong: () => {
    const { queue, currentIndex, repeatMode, isShuffle, currentSong, playerApi } = get();
    if (queue.length === 0) return;

    // 1. Repeat ONE mode
    if (repeatMode === 'one' && currentSong) {
      playerApi?.seek(0);
      playerApi?.playSong(currentSong);
      set({ position: 0, isPlaying: true });
      return;
    }

    let nextIndex = currentIndex;

    // 2. Shuffle mode
    if (isShuffle && queue.length > 1) {
      
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else {
      // Sequential play
      if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else {
        
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          
          get().stop();
          return;
        }
      }
    }

    const next = queue[nextIndex];
    if (next) {
      playerApi?.playSong(next);
      set({
        currentIndex: nextIndex,
        currentSong: next,
        isPlaying: true,
        position: 0,
      });
      get().addRecentlyPlayed(next);
      get().incrementPlayCount(next.id);
    }
  },

  previousSong: () => {
    const { queue, currentIndex, repeatMode, isShuffle, currentSong, playerApi } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentSong) {
      playerApi?.seek(0);
      playerApi?.playSong(currentSong);
      set({ position: 0, isPlaying: true });
      return;
    }

    let prevIndex = currentIndex;

    if (isShuffle && queue.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * queue.length);
      } while (prevIndex === currentIndex);
    } else {
      if (currentIndex > 0) {
        prevIndex = currentIndex - 1;
      } else {
        if (repeatMode === 'all') {
          prevIndex = queue.length - 1;
        } else {
          
          playerApi?.seek(0);
          set({ position: 0 });
          return;
        }
      }
    }

    const prev = queue[prevIndex];
    if (prev) {
      playerApi?.playSong(prev);
      set({
        currentIndex: prevIndex,
        currentSong: prev,
        isPlaying: true,
        position: 0,
      });
      get().addRecentlyPlayed(prev);
      get().incrementPlayCount(prev.id);
    }
  },

  playSong: (song) => {
    const { queue, playerApi } = get();

    
    const idx = queue.findIndex((s) => s.id === song.id);

    if (idx >= 0) {
      playerApi?.playSong(song);
      set({
        currentIndex: idx,
        currentSong: song,
        isPlaying: true,
        position: 0,
      });
    } else {
      // Append to queue
      const updatedQueue = [...queue, song];
      saveQueue(updatedQueue);
      playerApi?.playSong(song);
      set({
        queue: updatedQueue,
        currentIndex: updatedQueue.length - 1,
        currentSong: song,
        isPlaying: true,
        position: 0,
      });
    }

    // Record stats
    get().addRecentlyPlayed(song);
    get().incrementPlayCount(song.id);
  },

  pause: () => {
    const { playerApi } = get();
    playerApi?.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    const { playerApi } = get();
    playerApi?.resume();
    set({ isPlaying: true });
  },

  seek: (ms) => {
    const { playerApi } = get();
    playerApi?.seek(ms);
  },

  stop: () => {
    const { playerApi } = get();
    playerApi?.stop();
    set({
      isPlaying: false,
      position: 0,
    });
  },

  removeFromQueue: (songId) => {
    const { queue, currentSong, currentIndex, playerApi } = get();
    const removedIndex = queue.findIndex((s) => s.id === songId);

    if (removedIndex === -1) return;

    const updatedQueue = queue.filter((s) => s.id !== songId);
    saveQueue(updatedQueue);

    if (updatedQueue.length === 0) {
      playerApi?.stop();
      set({
        queue: [],
        currentIndex: 0,
        currentSong: null,
        isPlaying: false,
        position: 0,
        duration: 0,
      });
      return;
    }

    if (currentSong?.id === songId) {
      
      const nextIndex = Math.min(removedIndex, updatedQueue.length - 1);
      const nextSong = updatedQueue[nextIndex];

      playerApi?.playSong(nextSong);
      set({
        queue: updatedQueue,
        currentIndex: nextIndex,
        currentSong: nextSong,
        isPlaying: true,
        position: 0,
      });
    } else {
      // Readjust index
      const newCurrentIndex = updatedQueue.findIndex((s) => s.id === currentSong?.id);
      set({
        queue: updatedQueue,
        currentIndex:
          newCurrentIndex >= 0 ? newCurrentIndex : Math.min(currentIndex, updatedQueue.length - 1),
      });
    }
  },

  reorderQueue: (songs) => {
    saveQueue(songs);
    const { currentSong, currentIndex, playerApi } = get();

    if (songs.length === 0) {
      playerApi?.stop();
      set({
        queue: [],
        currentIndex: 0,
        currentSong: null,
        isPlaying: false,
        position: 0,
        duration: 0,
      });
      return;
    }

    const foundIdx = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;

    if (currentSong && foundIdx === -1) {
      playerApi?.stop();
      set({
        queue: songs,
        currentIndex: 0,
        currentSong: null,
        isPlaying: false,
      });
    } else {
      set({
        queue: songs,
        currentIndex: foundIdx >= 0 ? foundIdx : Math.min(currentIndex, songs.length - 1),
      });
    }
  },

  addToQueue: (song) => {
    const { queue } = get();
    const exists = queue.some((s) => s.id === song.id);

    if (exists) return false;

    const updatedQueue = [...queue, song];
    saveQueue(updatedQueue);
    set({ queue: updatedQueue });
    return true;
  },

  registerPlayerApi: (api) => set({ playerApi: api }),
  unregisterPlayerApi: () => set({ playerApi: null }),

  // Settings Actions
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    saveTheme(nextTheme);
    set({ theme: nextTheme });
  },

  setAudioQuality: (quality) => {
    saveAudioQuality(quality);
    set({ audioQuality: quality });
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      let nextMode: 'none' | 'all' | 'one' = 'none';
      if (state.repeatMode === 'none') nextMode = 'all';
      else if (state.repeatMode === 'all') nextMode = 'one';
      return { repeatMode: nextMode };
    });
  },

  setPlaybackSpeed: (speed) => {
    get().playerApi?.setSpeed(speed);
    set({ playbackSpeed: speed });
  },

  
  toggleFavorite: (song) => {
    set((state) => {
      const nextFavorites = { ...state.favorites };
      if (nextFavorites[song.id]) {
        delete nextFavorites[song.id];
      } else {
        nextFavorites[song.id] = song;
      }
      saveFavorites(nextFavorites);
      return { favorites: nextFavorites };
    });
  },

  addRecentlyPlayed: (song) => {
    set((state) => {
      const filtered = state.recentlyPlayed.filter((s) => s.id !== song.id);
      const nextHistory = [song, ...filtered].slice(0, 20); // Cap at 20 songs
      saveHistory(nextHistory);
      return { recentlyPlayed: nextHistory };
    });
  },

  addRecentSearch: (query) => {
    if (!query || query.trim() === '') return;
    set((state) => {
      const filtered = state.recentSearches.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const nextSearches = [query, ...filtered].slice(0, 15); // Cap at 15 queries
      saveSearches(nextSearches);
      return { recentSearches: nextSearches };
    });
  },

  removeRecentSearch: (query) => {
    set((state) => {
      const nextSearches = state.recentSearches.filter((q) => q !== query);
      saveSearches(nextSearches);
      return { recentSearches: nextSearches };
    });
  },

  clearRecentSearches: () => {
    saveSearches([]);
    set({ recentSearches: [] });
  },

  incrementPlayCount: (songId) => {
    set((state) => {
      const nextPlayCounts = { ...state.playCounts };
      nextPlayCounts[songId] = (nextPlayCounts[songId] || 0) + 1;
      savePlayCounts(nextPlayCounts);
      return { playCounts: nextPlayCounts };
    });
  },

  
  createPlaylist: (name) => {
    if (!name || name.trim() === '') return;
    set((state) => {
      if (state.playlists[name]) return state; // Playlist already exists
      const nextPlaylists = { ...state.playlists, [name]: [] };
      savePlaylists(nextPlaylists);
      return { playlists: nextPlaylists };
    });
  },

  deletePlaylist: (name) => {
    set((state) => {
      const nextPlaylists = { ...state.playlists };
      delete nextPlaylists[name];
      savePlaylists(nextPlaylists);
      return { playlists: nextPlaylists };
    });
  },

  addSongToPlaylist: (name, song) => {
    set((state) => {
      const playlist = state.playlists[name];
      if (!playlist) return state;
      if (playlist.some((s) => s.id === song.id)) return state; // Song already in playlist

      const nextPlaylists = {
        ...state.playlists,
        [name]: [...playlist, song],
      };
      savePlaylists(nextPlaylists);
      return { playlists: nextPlaylists };
    });
  },

  removeSongFromPlaylist: (name, songId) => {
    set((state) => {
      const playlist = state.playlists[name];
      if (!playlist) return state;

      const nextPlaylists = {
        ...state.playlists,
        [name]: playlist.filter((s) => s.id !== songId),
      };
      savePlaylists(nextPlaylists);
      return { playlists: nextPlaylists };
    });
  },

  
  loadStoredQueue: async () => {
    try {
      const queue = await loadQueue();
      set({ queue });
    } catch (error) {
      console.error('Failed to load queue', error);
    }
  },

  loadStoredDownloads: async () => {
    try {
      const downloadedSongs = await loadDownloadedSongs();
      set({ downloadedSongs });
    } catch (error) {
      console.error('Failed to load downloaded songs', error);
    }
  },

  loadStoredMetadata: async () => {
    try {
      const [
        favorites,
        playlists,
        recentlyPlayed,
        recentSearches,
        theme,
        playCounts,
        audioQuality,
      ] = await Promise.all([
        loadFavorites(),
        loadPlaylists(),
        loadHistory(),
        loadSearches(),
        loadTheme(),
        loadPlayCounts(),
        loadAudioQuality(),
      ]);

      set({
        favorites,
        playlists,
        recentlyPlayed,
        recentSearches,
        theme,
        playCounts,
        audioQuality,
      });
    } catch (error) {
      console.error('Failed to load metadata', error);
    }
  },

  // Download Actions
  downloadSong: async (song) => {
    const { downloadedSongs } = get();
    if (downloadedSongs[song.id]) return;

    set((state) => ({
      isDownloadingSongs: {
        ...state.isDownloadingSongs,
        [song.id]: true,
      },
    }));

    try {
      const downloadRecord = await downloadSongFile(song);
      const nextDownloadedSongs = {
        ...get().downloadedSongs,
        [song.id]: {
          ...downloadRecord,
          song,
        } as any,
      };

      set({ downloadedSongs: nextDownloadedSongs });
      await saveDownloadedSongs(nextDownloadedSongs);
    } catch (error) {
      console.error('Failed to download song', error);
    } finally {
      set((state) => ({
        isDownloadingSongs: {
          ...state.isDownloadingSongs,
          [song.id]: false,
        },
      }));
    }
  },

  removeDownloadedSong: async (songId) => {
    const record = get().downloadedSongs[songId];
    if (!record) return;

    await deleteDownloadedSongFile(record.localUri);

    const nextDownloadedSongs = { ...get().downloadedSongs };
    delete nextDownloadedSongs[songId];

    set({ downloadedSongs: nextDownloadedSongs });
    await saveDownloadedSongs(nextDownloadedSongs);
  },
}));
