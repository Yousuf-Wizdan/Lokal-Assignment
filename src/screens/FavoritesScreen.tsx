import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { Song } from '@/types/song';
import SongCard from '@/components/SongCard';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const theme = usePlayerStore((state) => state.theme);
  const favorites = usePlayerStore((state) => state.favorites);
  const downloadedSongs = usePlayerStore((state) => state.downloadedSongs);
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);
  const playSong = usePlayerStore((state) => state.playSong);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'liked' | 'downloads'>('liked');

  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const likedList = useMemo(() => {
    return Object.values(favorites);
  }, [favorites]);

  const downloadsList = useMemo(() => {
    return Object.entries(downloadedSongs)
      .map(([songId, record]: [string, any]) => {
        if (!record) return null;
        if (record.song) return record.song;
        if (record.name && record.artist) return record as unknown as Song;
        if (favorites[songId]) return favorites[songId];
        const fromHistory = recentlyPlayed.find((s) => s.id === songId);
        if (fromHistory) return fromHistory;
        return null;
      })
      .filter(Boolean) as Song[];
  }, [downloadedSongs, favorites, recentlyPlayed]);

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  const handlePlaySong = (song: Song, list: Song[]) => {
    setQueue(list);
    playSong(song);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="px-6 pb-2 pt-2">
        <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
          Library
        </Text>
      </View>

      
      <View
        className={`flex-row justify-around border-b ${
          isDark ? 'border-slate-900' : 'border-slate-100'
        }`}
        style={{ height: 45 }}>
        <Pressable
          onPress={() => setActiveTab('liked')}
          className="relative flex-1 items-center justify-center">
          <Text
            className={`text-sm font-bold ${
              activeTab === 'liked'
                ? 'text-orange-500'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Favorites
          </Text>
          {activeTab === 'liked' && (
            <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500" />
          )}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('downloads')}
          className="relative flex-1 items-center justify-center">
          <Text
            className={`text-sm font-bold ${
              activeTab === 'downloads'
                ? 'text-orange-500'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Downloads
          </Text>
          {activeTab === 'downloads' && (
            <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500" />
          )}
        </Pressable>
      </View>

      
      <View className="mt-3 flex-1">
        {activeTab === 'liked' ? (
          <FlatList
            data={likedList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SongCard
                song={item}
                onPress={(song) => handlePlaySong(song, likedList)}
                onOptionsPress={openOptions}
              />
            )}
            ListEmptyComponent={() => (
              <View className="items-center px-8 py-20">
                <Ionicons name="heart-outline" size={50} color={isDark ? '#475569' : '#cbd5e1'} />
                <Text
                  className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No Favorites Yet
                </Text>
                <Text
                  className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Tap the heart icon on any song options menu to add it to your library.
                </Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={downloadsList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SongCard
                song={item}
                onPress={(song) => handlePlaySong(song, downloadsList)}
                onOptionsPress={openOptions}
              />
            )}
            ListEmptyComponent={() => (
              <View className="items-center px-8 py-20">
                <Ionicons
                  name="download-outline"
                  size={50}
                  color={isDark ? '#475569' : '#cbd5e1'}
                />
                <Text
                  className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No Downloads Yet
                </Text>
                <Text
                  className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Download tracks from the options menu to play them without internet connectivity.
                </Text>
              </View>
            )}
          />
        )}
      </View>

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}
