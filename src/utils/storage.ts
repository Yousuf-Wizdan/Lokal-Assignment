import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song';

const QUEUE_KEY = 'PLAYER_QUEUE';
const FAVORITES_KEY = 'PLAYER_FAVORITES';
const PLAYLISTS_KEY = 'PLAYER_PLAYLISTS';
const HISTORY_KEY = 'PLAYER_HISTORY';
const SEARCHES_KEY = 'PLAYER_SEARCHES';
const THEME_KEY = 'PLAYER_THEME';
const PLAY_COUNTS_KEY = 'PLAYER_PLAY_COUNTS';

export const saveQueue = async (queue: Song[]) => {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save queue', error);
  }
};

export const loadQueue = async (): Promise<Song[]> => {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load queue', error);
    return [];
  }
};

export const saveFavorites = async (favorites: Record<string, Song>) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites', error);
  }
};

export const loadFavorites = async (): Promise<Record<string, Song>> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load favorites', error);
    return {};
  }
};

export const savePlaylists = async (playlists: Record<string, Song[]>) => {
  try {
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error('Failed to save playlists', error);
  }
};

export const loadPlaylists = async (): Promise<Record<string, Song[]>> => {
  try {
    const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load playlists', error);
    return {};
  }
};

export const saveHistory = async (history: Song[]) => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history', error);
  }
};

export const loadHistory = async (): Promise<Song[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history', error);
    return [];
  }
};

export const saveSearches = async (searches: string[]) => {
  try {
    await AsyncStorage.setItem(SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Failed to save searches', error);
  }
};

export const loadSearches = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load searches', error);
    return [];
  }
};

export const saveTheme = async (theme: 'light' | 'dark') => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme', error);
  }
};

export const loadTheme = async (): Promise<'light' | 'dark'> => {
  try {
    const data = await AsyncStorage.getItem(THEME_KEY);
    return (data as 'light' | 'dark') || 'light';
  } catch (error) {
    console.error('Failed to load theme', error);
    return 'light';
  }
};

const AUDIO_QUALITY_KEY = 'PLAYER_AUDIO_QUALITY';

export const saveAudioQuality = async (quality: 'standard' | 'high' | 'extreme') => {
  try {
    await AsyncStorage.setItem(AUDIO_QUALITY_KEY, quality);
  } catch (error) {
    console.error('Failed to save audio quality', error);
  }
};

export const loadAudioQuality = async (): Promise<'standard' | 'high' | 'extreme'> => {
  try {
    const data = await AsyncStorage.getItem(AUDIO_QUALITY_KEY);
    return (data as 'standard' | 'high' | 'extreme') || 'extreme';
  } catch (error) {
    console.error('Failed to load audio quality', error);
    return 'extreme';
  }
};

export const savePlayCounts = async (playCounts: Record<string, number>) => {
  try {
    await AsyncStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(playCounts));
  } catch (error) {
    console.error('Failed to save play counts', error);
  }
};

export const loadPlayCounts = async (): Promise<Record<string, number>> => {
  try {
    const data = await AsyncStorage.getItem(PLAY_COUNTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load play counts', error);
    return {};
  }
};
