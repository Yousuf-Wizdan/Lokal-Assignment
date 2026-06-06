import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';

export default function MiniPlayer() {
  const navigation = useNavigation<any>();
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const theme = usePlayerStore((state) => state.theme);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);

  const isDark = theme === 'dark';

  if (!currentSong) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Pressable
      onPress={() => navigation.navigate('Player')}
      className={`relative mx-4 my-2 flex-row items-center overflow-hidden rounded-3xl border px-4 py-3 ${
        isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
      }`}
      style={{
        height: 72,
        shadowColor: '#ff8216',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.15 : 0.06,
        shadowRadius: 10,
        elevation: 6,
      }}>
      
      <View className="absolute left-0 right-0 top-0 h-[3px] overflow-hidden bg-slate-200/40 dark:bg-slate-800/40">
        <View className="h-full bg-orange-500" style={{ width: `${progress * 100}%` }} />
      </View>

      
      <View
        className="overflow-hidden rounded-2xl border border-slate-200/30 dark:border-slate-800/30"
        style={{ width: 48, height: 48 }}>
        <Image
          source={{
            uri: currentSong.image || 'https://placehold.co/150x150',
          }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      
      <View className="ml-3.5 mr-4 flex-1">
        <Text
          numberOfLines={1}
          className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {currentSong.name}
        </Text>
        <Text
          numberOfLines={1}
          className={`mt-0.5 text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {currentSong.artist}
        </Text>
      </View>

      
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (isPlaying) {
            usePlayerStore.getState().pause();
          } else {
            usePlayerStore.getState().resume();
          }
        }}
        className={`mr-2 h-10 w-10 items-center justify-center rounded-full ${
          isDark ? 'bg-orange-500/10' : 'bg-orange-50'
        } active:scale-95`}>
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={22}
          color="#ff8216"
          style={{ marginLeft: isPlaying ? 0 : 2 }}
        />
      </Pressable>

      
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          nextSong();
        }}
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isDark ? 'active:bg-slate-800' : 'active:bg-slate-100'
        } active:scale-95`}>
        <MaterialIcons name="skip-next" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>
    </Pressable>
  );
}
