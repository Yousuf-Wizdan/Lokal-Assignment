import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Song } from '../types/song';
import { usePlayerStore } from '../store/playerStore';

interface SongCardProps {
  song: Song;
  onPress?: (song: Song) => void;
  onOptionsPress?: (song: Song) => void;
  onPlayPress?: (song: Song) => void;
}

export default function SongCard({ song, onPress, onOptionsPress, onPlayPress }: SongCardProps) {
  const theme = usePlayerStore((state) => state.theme);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const isDark = theme === 'dark';
  const isCurrent = currentSong?.id === song.id;

  const formatSongDuration = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    const padMin = min.toString().padStart(2, '0');
    const padSec = sec.toString().padStart(2, '0');
    return `${padMin}:${padSec} mins`;
  };

  return (
    <Pressable
      onPress={() => onPress?.(song)}
      className={`relative mb-2 flex-row items-center rounded-[16px] p-2.5 ${
        isCurrent ? (isDark ? 'bg-orange-500/10' : 'bg-orange-500/5') : 'bg-transparent'
      }`}
      style={
        isCurrent
          ? {
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.12 : 0.03,
              shadowRadius: 4,
              elevation: 1,
            }
          : undefined
      }>
      
      {isCurrent && (
        <View className="absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-full bg-orange-500" />
      )}

      
      <Image
        source={{
          uri: song.image || 'https://placehold.co/150x150',
        }}
        className="rounded-[12px]"
        style={{
          width: 50,
          height: 50,
        }}
      />

      
      <View className="ml-3 flex-1 justify-center">
        <Text
          numberOfLines={1}
          className={`text-base font-extrabold tracking-wide ${
            isCurrent ? 'text-orange-500' : isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
          {song.name}
        </Text>

        <Text
          numberOfLines={1}
          className={`mt-1 text-xs font-semibold ${
            isCurrent ? 'text-orange-500/80' : isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
          {song.artist} <Text className="opacity-40">|</Text> {formatSongDuration(song.duration)}
        </Text>
      </View>

      
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (onPlayPress) {
            onPlayPress(song);
          } else {
            // Default behavior
            if (isCurrent) {
              if (isPlaying) {
                usePlayerStore.getState().pause();
              } else {
                usePlayerStore.getState().resume();
              }
            } else {
              usePlayerStore.getState().playSong(song);
            }
          }
        }}
        className={`h-9 w-9 items-center justify-center rounded-full active:scale-95 ${
          isCurrent ? 'bg-orange-500 shadow-md shadow-orange-500/40' : 'bg-transparent'
        }`}
        style={{
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isCurrent ? 0.3 : 0,
          shadowRadius: 3,
          elevation: isCurrent ? 2 : 0,
        }}>
        <MaterialIcons
          name={isCurrent && isPlaying ? 'pause' : 'play-arrow'}
          size={20}
          color={isCurrent ? 'white' : isDark ? '#94a3b8' : '#64748b'}
        />
      </Pressable>

      
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onOptionsPress?.(song);
        }}
        className={`ml-1 rounded-full p-2 active:scale-95 ${
          isDark ? 'active:bg-slate-800/60' : 'active:bg-slate-250/60'
        }`}>
        <MaterialIcons name="more-vert" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>
    </Pressable>
  );
}
