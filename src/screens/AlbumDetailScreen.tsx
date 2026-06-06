import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { getAlbumSongs } from '@/api/songs';
import { Song } from '@/types/song';
import SongCard from '@/components/SongCard';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function AlbumDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { albumId, albumName, albumImage, artistName } = route.params;

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
      const res = await getAlbumSongs(albumId);
      setSongs(res);
      setIsLoading(false);
    };
    fetchSongs();
  }, [albumId]);

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

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-row items-center justify-between px-6 py-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="rounded-full p-2 active:bg-slate-200/20">
          <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
        </Pressable>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Album
        </Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff8216" />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          ListHeaderComponent={() => (
            <View className="mb-6 mt-4 items-center">
              
              <Image
                source={{ uri: albumImage || 'https://placehold.co/300x300' }}
                className="rounded-[32px]"
                style={{
                  width: 230,
                  height: 230,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                }}
              />
              <Text
                className={`mt-5 px-4 text-center text-xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {albumName}
              </Text>
              <Text
                className={`mt-1 text-center text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {artistName} | {songs.length} Tracks
              </Text>

              
              <View className="mt-6 w-full flex-row justify-between px-2">
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
                    isDark
                      ? 'border-orange-900/40 bg-orange-950/20'
                      : 'border-orange-200 bg-orange-50'
                  }`}>
                  <Ionicons name="play" size={18} color="#ff8216" />
                  <Text className="ml-2 text-sm font-bold text-orange-500">PlayAll</Text>
                </Pressable>
              </View>

              
              <Text
                className={`mb-2 mt-6 w-full px-2 text-left text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tracks
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={(song) => {
                setQueue(songs);
                playSong(song);
                navigation.navigate('Player');
              }}
              onOptionsPress={openOptions}
            />
          )}
          ListEmptyComponent={() => (
            <View className="items-center py-10">
              <Text className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No tracks found in this album.
              </Text>
            </View>
          )}
        />
      )}

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}
