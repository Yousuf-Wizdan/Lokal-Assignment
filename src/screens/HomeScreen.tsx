import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import SongCard from '../components/SongCard';
import { useSongs } from '../hooks/useSongs';
import { usePlayerStore } from '@/store/playerStore';
import { Song, Artist, Album } from '@/types/song';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';
import { searchArtists, searchAlbums } from '@/api/songs';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const theme = usePlayerStore((state) => state.theme);
  const playSong = usePlayerStore((state) => state.playSong);
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);
  const playCounts = usePlayerStore((state) => state.playCounts);

  const isDark = theme === 'dark';

  
  const [activeSubTab, setActiveSubTab] = useState<'suggested' | 'songs' | 'artists' | 'albums'>(
    'suggested'
  );

  
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  
  const [sortOption, setSortOption] = useState<'ascending' | 'descending' | 'artist' | 'duration'>(
    'ascending'
  );
  const [showSortModal, setShowSortModal] = useState(false);

  
  const popularArtists: Artist[] = [
    {
      id: '589552',
      name: 'Ariana Grande',
      image: 'https://c.saavncdn.com/artists/Ariana_Grande_005_20201127111716_150x150.jpg',
    },
    {
      id: '615155',
      name: 'The Weeknd',
      image: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_150x150.jpg',
    },
    {
      id: '459320',
      name: 'Arijit Singh',
      image: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_150x150.jpg',
    },
    {
      id: '565990',
      name: 'Taylor Swift',
      image: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_150x150.jpg',
    },
    {
      id: '568565',
      name: 'Justin Bieber',
      image: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_150x150.jpg',
    },
    {
      id: '456323',
      name: 'Pritam',
      image: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_150x150.jpg',
    },
  ];

  
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [albumsList, setAlbumsList] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  
  const {
    data,
    isLoading: isLoadingSongs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSongs('latest hits');

  
  const songs = useMemo(() => {
    const allSongs = data?.pages.flatMap((page) => page.songs) ?? [];
    const uniqueSongs = new Map<string, Song>();
    for (const song of allSongs) {
      if (!uniqueSongs.has(song.id)) {
        uniqueSongs.set(song.id, song);
      }
    }
    return Array.from(uniqueSongs.values());
  }, [data]);

  
  const sortedSongs = useMemo(() => {
    const items = [...songs];
    if (sortOption === 'ascending') {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'descending') {
      return items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'artist') {
      return items.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortOption === 'duration') {
      return items.sort((a, b) => a.duration - b.duration);
    }
    return items;
  }, [songs, sortOption]);

  
  const mostPlayedSongs = useMemo(() => {
    if (Object.keys(playCounts).length === 0) {
      return songs.slice(0, 8);
    }
    
    const items = [...recentlyPlayed];
    return items.sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0)).slice(0, 8);
  }, [recentlyPlayed, playCounts, songs]);

  
  useEffect(() => {
    if (activeSubTab === 'artists' && artistsList.length === 0) {
      const fetchArtists = async () => {
        setIsLoadingArtists(true);
        const res = await searchArtists('singers');
        setArtistsList(res.artists);
        setIsLoadingArtists(false);
      };
      fetchArtists();
    } else if (activeSubTab === 'albums' && albumsList.length === 0) {
      const fetchAlbums = async () => {
        setIsLoadingAlbums(true);
        const res = await searchAlbums('hits');
        setAlbumsList(res.albums);
        setIsLoadingAlbums(false);
      };
      fetchAlbums();
    }
  }, [activeSubTab]);

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  const handleArtistClick = (artist: Artist) => {
    navigation.navigate('ArtistDetail', {
      artistId: artist.id,
      artistName: artist.name,
      artistImage: artist.image,
    });
  };

  const handleAlbumClick = (album: Album) => {
    navigation.navigate('AlbumDetail', {
      albumId: album.id,
      albumName: album.name,
      albumImage: album.image,
      artistName: album.artist,
    });
  };

  
  const renderTabContent = () => {
    switch (activeSubTab) {
      case 'suggested':
        return (
          <ScrollView
            className="mt-2 flex-1 px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            
            <View className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Recently Played
                </Text>
                {recentlyPlayed.length > 0 && (
                  <Pressable onPress={() => setActiveSubTab('songs')}>
                    <Text className="text-sm font-semibold text-orange-500">See All</Text>
                  </Pressable>
                )}
              </View>
              {recentlyPlayed.length === 0 ? (
                <View
                  className={`items-center rounded-2xl p-6 ${
                    isDark ? 'bg-slate-900/30' : 'bg-slate-100/40'
                  }`}>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No recently played tracks yet.
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentlyPlayed.map((song) => (
                    <Pressable
                      key={song.id}
                      onPress={() => {
                        playSong(song);
                        navigation.navigate('Player');
                      }}
                      className="mr-4 items-center"
                      style={{ width: 110 }}>
                      <Image
                        source={{ uri: song.image }}
                        className="rounded-2xl"
                        style={{ width: 100, height: 100 }}
                      />
                      <Text
                        numberOfLines={1}
                        className={`mt-2 w-full text-center text-xs font-semibold ${
                          isDark ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                        {song.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`mt-0.5 w-full text-center text-[10px] ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                        {song.artist}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            
            <View className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Artists
                </Text>
                <Pressable onPress={() => setActiveSubTab('artists')}>
                  <Text className="text-sm font-semibold text-orange-500">See All</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularArtists.map((artist) => (
                  <Pressable
                    key={artist.id}
                    onPress={() => handleArtistClick(artist)}
                    className="mr-4 items-center"
                    style={{ width: 90 }}>
                    <Image
                      source={{ uri: artist.image }}
                      className="rounded-full"
                      style={{ width: 75, height: 75 }}
                    />
                    <Text
                      numberOfLines={1}
                      className={`mt-2 w-full text-center text-xs font-semibold ${
                        isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}>
                      {artist.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            
            <View className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Most Played
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mostPlayedSongs.map((song) => (
                  <Pressable
                    key={song.id}
                    onPress={() => {
                      playSong(song);
                      navigation.navigate('Player');
                    }}
                    className="mr-4 items-center"
                    style={{ width: 110 }}>
                    <Image
                      source={{ uri: song.image }}
                      className="rounded-2xl"
                      style={{ width: 100, height: 100 }}
                    />
                    <Text
                      numberOfLines={1}
                      className={`mt-2 w-full text-center text-xs font-semibold ${
                        isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}>
                      {song.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className={`mt-0.5 w-full text-center text-[10px] ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                      {song.artist}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        );

      case 'songs':
        if (isLoadingSongs && songs.length === 0) {
          return (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#ff8216" />
            </View>
          );
        }
        return (
          <View className="mt-2 flex-1 px-4">
            
            <View className="mb-4 flex-row items-center justify-between px-1">
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {songs.length} songs
              </Text>
              <Pressable
                onPress={() => setShowSortModal(true)}
                className="flex-row items-center rounded-full bg-orange-50 px-3 py-1.5 active:opacity-60 dark:bg-orange-950/20">
                <Text className="mr-1 text-xs font-bold capitalize text-orange-500">
                  {sortOption}
                </Text>
                <Ionicons name="swap-vertical" size={14} color="#ff8216" />
              </Pressable>
            </View>

            <FlatList
              data={sortedSongs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <SongCard
                  song={item}
                  onPress={(song) => {
                    playSong(song);
                    navigation.navigate('Player');
                  }}
                  onOptionsPress={openOptions}
                />
              )}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                isFetchingNextPage ? (
                  <View className="py-6">
                    <ActivityIndicator color="#ff8216" />
                  </View>
                ) : null
              }
            />
          </View>
        );

      case 'artists':
        if (isLoadingArtists) {
          return (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#ff8216" />
            </View>
          );
        }
        return (
          <FlatList
            data={artistsList}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleArtistClick(item)}
                className={`mx-1.5 mb-6 flex-1 items-center rounded-3xl p-3 ${
                  isDark ? 'bg-slate-900/30' : 'bg-slate-100/40'
                }`}
                style={{
                  maxWidth: '47%',
                }}>
                <Image
                  source={{ uri: item.image || 'https://placehold.co/150x150' }}
                  className="rounded-full"
                  style={{ width: 100, height: 100 }}
                />
                <Text
                  numberOfLines={1}
                  className={`mt-3 w-full text-center text-sm font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        );

      case 'albums':
        if (isLoadingAlbums) {
          return (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#ff8216" />
            </View>
          );
        }
        return (
          <FlatList
            data={albumsList}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleAlbumClick(item)}
                className={`mx-1.5 mb-6 flex-1 items-center rounded-3xl p-3 ${
                  isDark ? 'bg-slate-900/30' : 'bg-slate-100/40'
                }`}
                style={{
                  maxWidth: '47%',
                }}>
                <Image
                  source={{ uri: item.image || 'https://placehold.co/150x150' }}
                  className="rounded-2xl"
                  style={{ width: 100, height: 100 }}
                />
                <Text
                  numberOfLines={1}
                  className={`mt-3 w-full text-left text-sm font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                  {item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`mt-0.5 w-full text-left text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                  {item.artist}
                </Text>
              </Pressable>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
        <View className="flex-row items-center">
          <Ionicons name="musical-notes" size={26} color="#ff8216" />
          <Text className={`ml-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
            LokalPlay
          </Text>
        </View>

        
        <Pressable
          onPress={() => navigation.navigate('Search')}
          className={`rounded-full p-2 active:bg-slate-200/20`}>
          <Ionicons name="search-outline" size={24} color={isDark ? 'white' : 'black'} />
        </Pressable>
      </View>

      
      <View className="mt-2 px-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={`flex-row border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
          contentContainerStyle={{ paddingBottom: 0 }}>
          
          <Pressable onPress={() => setActiveSubTab('suggested')} className="relative mr-6 pb-2">
            <Text
              className={`text-base font-semibold ${
                activeSubTab === 'suggested'
                  ? 'font-bold text-orange-500'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}>
              Suggested
            </Text>
            {activeSubTab === 'suggested' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </Pressable>

          
          <Pressable onPress={() => setActiveSubTab('songs')} className="relative mr-6 pb-2">
            <Text
              className={`text-base font-semibold ${
                activeSubTab === 'songs'
                  ? 'font-bold text-orange-500'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}>
              Songs
            </Text>
            {activeSubTab === 'songs' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </Pressable>

          
          <Pressable onPress={() => setActiveSubTab('artists')} className="relative mr-6 pb-2">
            <Text
              className={`text-base font-semibold ${
                activeSubTab === 'artists'
                  ? 'font-bold text-orange-500'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}>
              Artists
            </Text>
            {activeSubTab === 'artists' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </Pressable>

          
          <Pressable onPress={() => setActiveSubTab('albums')} className="relative mr-6 pb-2">
            <Text
              className={`text-base font-semibold ${
                activeSubTab === 'albums'
                  ? 'font-bold text-orange-500'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}>
              Albums
            </Text>
            {activeSubTab === 'albums' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </Pressable>
        </ScrollView>
      </View>

      
      <View className="mt-3 flex-1">{renderTabContent()}</View>

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />

      
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}>
        <Pressable
          onPress={() => setShowSortModal(false)}
          className="flex-1 items-center justify-center bg-black/50 px-8">
          <View
            className={`w-full rounded-[32px] p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 12,
            }}>
            <Text className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Sort Songs
            </Text>

            
            {[
              { key: 'ascending', label: 'Ascending (A-Z)' },
              { key: 'descending', label: 'Descending (Z-A)' },
              { key: 'artist', label: 'By Artist' },
              { key: 'duration', label: 'By Duration' },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSortOption(option.key as any);
                  setShowSortModal(false);
                }}
                className="flex-row items-center justify-between py-3 active:opacity-60">
                <Text
                  className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {option.label}
                </Text>
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    sortOption === option.key ? 'border-orange-500' : 'border-slate-300'
                  }`}>
                  {sortOption === option.key && (
                    <View className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
