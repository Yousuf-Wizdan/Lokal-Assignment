import React, { useState } from 'react';
import { Image, Pressable, Text, View, Modal, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/formatTime';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function PlayerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const theme = usePlayerStore((state) => state.theme);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const previousSong = usePlayerStore((state) => state.previousSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const isShuffle = usePlayerStore((state) => state.isShuffle);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const favorites = usePlayerStore((state) => state.favorites);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);

  const isDark = theme === 'dark';

  const [showLyrics, setShowLyrics] = useState(false);

  const [optionsVisible, setOptionsVisible] = useState(false);


  const getMockLyrics = (songName: string) => {
    const name = songName.toLowerCase();
    if (name.includes('starboy')) {
      return [
        "I'm tryna put you in the worst mood, ah",
        'P1 cleaner than your church shoes, ah',
        'Milli point two on the table cut blue',
        'House so empty, need a centerpiece',
        'Twenty rack table cut from ebony',
        'Cut that trophy, girls are back in town',
        'Main girl out your league, too, ah',
        'Side girl out of your league too, ah',
        'House so empty, need a centerpiece',
        "Look what you've done...",
        "I'm a motherf***ing starboy",
        "Look what you've done...",
        "I'm a motherf***ing starboy",
      ];
    }
    if (name.includes('hawayein')) {
      return [
        'Tujhko... main rakh loon wahaan',
        'Jahaan pe kahin... hai mera yaqeen',
        'Main jo... tera naa huaa',
        'Kisi ka nahin... kisi ka nahin',
        'Hawaaon mein bahenge...',
        'Ghataon mein rahenge...',
        'Tu hoga jahaan main wahaan hoon...',
        'Hawayein... hawayein...',
        'Mujhe tanhaa na hone dein...',
        'Hawayein... hawayein...',
        'Hum dono ko behne dein...',
      ];
    }
    return [
      `🎵 [Music Playing] 🎵`,
      `Enjoying the premium beats of "${songName}"`,
      `By ${currentSong?.artist || 'Unknown Artist'}`,
      `Streamed in high quality (320kbps) via LokalPlay Player`,
      `Background audio fully active`,
      `Use LokalPlay offline downloader to listen anytime!`,
    ];
  };

  // Rewind 10s
  const handleRewind10 = () => {
    const newPos = Math.max(0, position - 10);
    usePlayerStore.getState().seek(newPos);
  };

  // Forward 10s
  const handleForward10 = () => {
    const newPos = Math.min(duration, position + 10);
    usePlayerStore.getState().seek(newPos);
  };

  if (!currentSong) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
        <Text className={isDark ? 'text-white' : 'text-slate-900'}>No song selected</Text>
      </View>
    );
  }

  const lyrics = getMockLyrics(currentSong.name);

  const isFavorited = currentSong ? !!favorites[currentSong.id] : false;

  return (
    <View
      className={`flex-1 justify-between px-6 ${isDark ? 'bg-slate-950' : 'bg-white'}`}
      style={{ paddingTop: Math.max(12, insets.top) }}>
      
      <View className="flex-row items-center justify-between py-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="rounded-full p-2 active:bg-slate-200/20">
          <Ionicons name="chevron-down" size={28} color={isDark ? 'white' : 'black'} />
        </Pressable>

        <Text
          className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Now Playing
        </Text>

        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.navigate('Queue')}
            className="mr-1 rounded-full p-2 active:bg-slate-200/20">
            <Ionicons name="list" size={26} color={isDark ? 'white' : 'black'} />
          </Pressable>
          <Pressable
            onPress={() => setOptionsVisible(true)}
            className="rounded-full p-2 active:bg-slate-200/20">
            <Ionicons name="ellipsis-vertical" size={24} color={isDark ? 'white' : 'black'} />
          </Pressable>
        </View>
      </View>

      
      <View className="my-6 flex-1 items-center justify-center">
        <View
          className="overflow-hidden rounded-[36px]"
          style={{
            width: 280,
            height: 280,
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            shadowColor: isDark ? '#ff8216' : '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDark ? 0.25 : 0.12,
            shadowRadius: 18,
            elevation: 10,
          }}>
          <Image
            source={{ uri: currentSong.image || 'https://placehold.co/300x300' }}
            className="h-full w-full rounded-[36px] border border-slate-200/40 dark:border-slate-800/40"
            resizeMode="cover"
          />
        </View>
      </View>

      
      <View className="mb-4 flex-row items-center justify-between px-6">
        <View className="flex-1 pr-4">
          <Text
            className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}
            numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text
            className={`mt-1.5 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <Pressable
          onPress={() => toggleFavorite(currentSong)}
          className={`rounded-full p-2.5 ${isDark ? 'active:bg-slate-800/30' : 'active:bg-slate-100/50'}`}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorited ? '#ff3b30' : isDark ? '#94a3b8' : '#64748b'}
          />
        </Pressable>
      </View>

      
      <View className="mb-4 px-2">
        <Slider
          minimumValue={0}
          maximumValue={duration || 0}
          value={position || 0}
          minimumTrackTintColor="#ff8216"
          maximumTrackTintColor={isDark ? '#334155' : '#cbd5e1'}
          thumbTintColor="#ff8216"
          style={{ width: '100%', height: 40 }}
          onSlidingComplete={(value) => {
            usePlayerStore.getState().seek(Math.floor(value));
          }}
        />

        <View className="mt-0.5 flex-row justify-between px-2">
          <Text className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(position || 0)}
          </Text>
          <Text className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(duration || 0)}
          </Text>
        </View>
      </View>

      
      <View className="mb-8 flex-row items-center justify-between px-2">
        
        <Pressable onPress={toggleShuffle} className="p-2">
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffle ? '#ff8216' : isDark ? '#64748b' : '#94a3b8'}
          />
        </Pressable>

        
        <Pressable onPress={previousSong} className="p-2 active:opacity-60">
          <Ionicons name="play-skip-back" size={26} color={isDark ? 'white' : 'black'} />
        </Pressable>

        
        <Pressable
          onPress={handleRewind10}
          className="rounded-full p-2 active:bg-slate-200/20 active:opacity-60">
          <MaterialIcons name="replay-10" size={32} color={isDark ? '#e2e8f0' : '#334155'} />
        </Pressable>

        
        <Pressable
          onPress={() => {
            if (isPlaying) {
              usePlayerStore.getState().pause();
              setIsPlaying(false);
            } else {
              usePlayerStore.getState().resume();
              setIsPlaying(true);
            }
          }}
          className="h-[72px] w-[72px] items-center justify-center rounded-full bg-orange-500 active:bg-orange-600"
          style={{
            shadowColor: '#ff8216',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color="white"
            style={{ marginLeft: isPlaying ? 0 : 4 }}
          />
        </Pressable>

        
        <Pressable
          onPress={handleForward10}
          className="rounded-full p-2 active:bg-slate-200/20 active:opacity-60">
          <MaterialIcons name="forward-10" size={32} color={isDark ? '#e2e8f0' : '#334155'} />
        </Pressable>

        
        <Pressable onPress={nextSong} className="p-2 active:opacity-60">
          <Ionicons name="play-skip-forward" size={26} color={isDark ? 'white' : 'black'} />
        </Pressable>

        
        <Pressable onPress={toggleRepeat} className="relative items-center p-2">
          <Ionicons
            name="repeat"
            size={24}
            color={repeatMode !== 'none' ? '#ff8216' : isDark ? '#64748b' : '#94a3b8'}
          />
          {repeatMode === 'one' && (
            <View
              className="absolute h-3 w-3 items-center justify-center rounded-full bg-orange-500"
              style={{ top: 0, right: 0 }}>
              <Text className="text-[7px] font-bold text-white">1</Text>
            </View>
          )}
        </Pressable>
      </View>

      
      <Pressable
        onPress={() => setShowLyrics(true)}
        className={`items-center justify-center rounded-t-3xl ${
          isDark ? 'bg-slate-900/60' : 'bg-slate-100'
        }`}
        style={{
          marginHorizontal: -24,
          paddingTop: 12,
          paddingBottom: Math.max(12, insets.bottom),
        }}>
        <Ionicons name="chevron-up" size={18} color="#ff8216" />
        <Text className="mt-1 text-xs font-bold uppercase tracking-widest text-orange-500">
          Lyrics
        </Text>
      </Pressable>

      
      <Modal
        visible={showLyrics}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLyrics(false)}>
        <View className="flex-1 justify-end bg-black/70">
          <Pressable className="flex-1" onPress={() => setShowLyrics(false)} />

          <View
            className={`rounded-t-[36px] px-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            style={{
              height: '70%',
              elevation: 24,
              paddingBottom: Math.max(24, insets.bottom),
            }}>
            <Pressable onPress={() => setShowLyrics(false)} className="items-center py-4">
              <Ionicons name="chevron-down" size={24} color="#ff8216" />
              <Text className="mt-1 text-xs font-bold uppercase tracking-widest text-orange-500">
                Lyrics
              </Text>
            </Pressable>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              <Text
                className={`mb-6 text-center text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentSong.name}
              </Text>

              {lyrics.map((line, idx) => (
                <Text
                  key={idx}
                  className={`py-2.5 text-center text-lg font-bold ${
                    idx === 0
                      ? 'text-orange-500' // Highlight current line
                      : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`}>
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={currentSong}
        onClose={() => setOptionsVisible(false)}
      />
    </View>
  );
}
