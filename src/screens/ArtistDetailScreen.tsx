import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { getArtistSongs } from '@/api/songs';
import { Song } from '@/types/song';
import SongCard from '@/components/SongCard';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function ArtistDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { artistId, artistName, artistImage } = route.params;

  const theme = usePlayerStore((state) => state.theme);
  const playSong = usePlayerStore((state) => state.playSong);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const isDark = theme === 'dark';

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Options drawer state
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      const res = await getArtistSongs(artistId);
      setSongs(res);
      setIsLoading(false);
    };
    fetchSongs();
  }, [artistId]);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    setQueue(songs);
    playSong(songs[0]);
    navigation.navigate('Player');
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
      usePlayerStore.setState({ isShuffle: true });
    playSong(shuffled[0]);
    navigation.navigate('Player');
  };

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  const getTotalDuration = () => {
    const totalSecs = songs.reduce((acc, song) => acc + song.duration, 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} mins`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} mins`;
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-row items-center justify-between px-6 py-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="rounded-full p-2 active:bg-slate-200/20">
          <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
        </Pressable>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Artist
        </Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff8216" />
        </View>
      ) : (
        <ScrollView
          className="mt-4 flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View className="mb-6 items-center">
            <Image
              source={{ uri: artistImage || 'https://placehold.co/300x300' }}
              className="rounded-[32px]"
              style={{
                width: 250,
                height: 250,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              }}
            />
            <Text
              className={`mt-5 text-center text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {artistName}
            </Text>
            <Text
              className={`mt-1 text-center text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              JioSaavn Artist | {songs.length} Songs | {getTotalDuration()}
            </Text>
          </View>

          
          <View className="mb-6 flex-row justify-between px-2">
            
            <Pressable
              onPress={handleShufflePlay}
              className="mr-3 flex-1 flex-row items-center justify-center rounded-2xl bg-orange-500 py-3.5 active:bg-orange-600"
              style={{
                shadowColor: '#ff8216',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}>
              <Ionicons name="shuffle" size={18} color="white" />
              <Text className="ml-2 text-sm font-bold text-white">Shuffle</Text>
            </Pressable>

            
            <Pressable
              onPress={handlePlayAll}
              className={`ml-3 flex-1 flex-row items-center justify-center rounded-2xl border py-3.5 active:opacity-80 ${
                isDark ? 'border-orange-900/40 bg-orange-950/20' : 'border-orange-200 bg-orange-50'
              }`}>
              <Ionicons name="play" size={18} color="#ff8216" />
              <Text className="ml-2 text-sm font-bold text-orange-500">Play</Text>
            </Pressable>
          </View>

          
          <View className="mb-4 flex-row items-center justify-between px-2">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Songs
            </Text>
          </View>

          
          {songs.length === 0 ? (
            <View className="items-center py-10">
              <Text className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No songs found for this artist.
              </Text>
            </View>
          ) : (
            songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPress={(item) => {
                  setQueue(songs);
                  playSong(item);
                  navigation.navigate('Player');
                }}
                onOptionsPress={openOptions}
              />
            ))
          )}
        </ScrollView>
      )}

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}
