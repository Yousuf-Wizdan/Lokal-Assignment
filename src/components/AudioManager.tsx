import { useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types/song';

export default function AudioManager() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const registerPlayerApi = usePlayerStore((state) => state.registerPlayerApi);
  const unregisterPlayerApi = usePlayerStore((state) => state.unregisterPlayerApi);

  const resolvedAudioUrl = currentSong
    ? (usePlayerStore.getState().downloadedSongs[currentSong.id]?.localUri ?? currentSong.audioUrl)
    : undefined;

  const player = useAudioPlayer(resolvedAudioUrl || undefined);
  const status = useAudioPlayerStatus(player);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.error('Audio mode setup failed:', error);
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    const api = {
      playSong: async (song: Song) => {
        setCurrentSong(song);
        setIsPlaying(true);
      },
      pause: async () => {
        try {
          playerRef.current?.pause?.();
        } catch (e) {
          console.error(e);
        }
      },
      resume: async () => {
        try {
          playerRef.current?.play?.();
        } catch (e) {
          console.error(e);
        }
      },
      seek: async (ms: number) => {
        try {
          playerRef.current?.seekTo?.(ms);
        } catch (e) {
          console.error(e);
        }
      },
      stop: async () => {
        try {
          playerRef.current?.pause?.();
          playerRef.current?.seekTo?.(0);
          setIsPlaying(false);
          setPosition(0);
        } catch (e) {
          console.error(e);
        }
      },
      setSpeed: async (rate: number) => {
        try {
          if (playerRef.current) {
            playerRef.current.playbackRate = rate;
          }
        } catch (e) {
          console.error(e);
        }
      },
    };

    registerPlayerApi(api);

    return () => {
      unregisterPlayerApi();
    };
  }, [registerPlayerApi, unregisterPlayerApi, setCurrentSong, setIsPlaying, setPosition]);

  
  useEffect(() => {
    if (!currentSong) return;

    try {
      player?.play?.();
      setIsPlaying(true);
    } catch (e) {
      console.error('AudioManager play failed', e);
    }
  }, [currentSong, player, setIsPlaying]);

  
  useEffect(() => {
    if (!status) return;

    if (status.currentTime !== undefined) setPosition(status.currentTime);
    if (status.duration !== undefined) setDuration(status.duration);
    if ((status as any).playing !== undefined) setIsPlaying(!!(status as any).playing);

    if (status.didJustFinish) {
      nextSong();
    }
  }, [status, setPosition, setDuration, setIsPlaying, nextSong]);

  return null;
}
