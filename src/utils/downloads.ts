import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { Song } from '../types/song';

export type DownloadRecord = {
  localUri: string;
  downloadedAt: number;
};

const DOWNLOADED_SONGS_KEY = 'PLAYER_DOWNLOADED_SONGS';
const DOWNLOAD_FOLDER = 'music-player-downloads';

const getBaseDirectory = () => {
  const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDirectory) {
    throw new Error('No writable file system directory found');
  }

  return baseDirectory;
};

const ensureDownloadDirectory = async () => {
  const directory = `${getBaseDirectory()}${DOWNLOAD_FOLDER}/`;
  const info = await FileSystem.getInfoAsync(directory);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });
  }

  return directory;
};

const getFileExtension = (url: string) => {
  const cleanUrl = url.split('?')[0];
  const lastPart = cleanUrl.split('.').pop();

  if (!lastPart) return 'mp4';

  const extension = lastPart.replace(/[^a-zA-Z0-9]/g, '');

  return extension || 'mp4';
};

export const loadDownloadedSongs = async (): Promise<Record<string, DownloadRecord>> => {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADED_SONGS_KEY);

    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, DownloadRecord>;

    const entries = await Promise.all(
      Object.entries(parsed).map(async ([songId, record]) => {
        if (!record?.localUri) return null;

        const info = await FileSystem.getInfoAsync(record.localUri);

        if (!info.exists) return null;

        return [songId, record] as const;
      })
    );

    return Object.fromEntries(entries.filter(Boolean) as [string, DownloadRecord][]);
  } catch (error) {
    console.error('Failed to load downloaded songs', error);
    return {};
  }
};

export const saveDownloadedSongs = async (downloads: Record<string, DownloadRecord>) => {
  try {
    await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, JSON.stringify(downloads));
  } catch (error) {
    console.error('Failed to save downloaded songs', error);
  }
};

export const getDownloadedSongPath = async (song: Song) => {
  const directory = await ensureDownloadDirectory();
  const extension = getFileExtension(song.audioUrl);

  return `${directory}${song.id}.${extension}`;
};

export const downloadSongFile = async (song: Song) => {
  const fileUri = await getDownloadedSongPath(song);

  const result = await FileSystem.downloadAsync(song.audioUrl, fileUri);

  return {
    localUri: result.uri || fileUri,
    downloadedAt: Date.now(),
  } satisfies DownloadRecord;
};

export const deleteDownloadedSongFile = async (localUri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(localUri);

    if (info.exists) {
      await FileSystem.deleteAsync(localUri, {
        idempotent: true,
      });
    }
  } catch (error) {
    console.error('Failed to delete downloaded song file', error);
  }
};
