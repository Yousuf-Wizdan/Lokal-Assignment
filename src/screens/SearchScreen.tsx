import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { Song, Artist, Album } from '@/types/song';
import { searchSongs, searchArtists, searchAlbums } from '@/api/songs';
import SongCard from '@/components/SongCard';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  
  const initialQuery = route.params?.initialQuery || '';
  const initialTab = route.params?.initialTab || 'songs';

  const theme = usePlayerStore((state) => state.theme);
  const playSong = usePlayerStore((state) => state.playSong);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const recentSearches = usePlayerStore((state) => state.recentSearches);
  const addRecentSearch = usePlayerStore((state) => state.addRecentSearch);
  const removeRecentSearch = usePlayerStore((state) => state.removeRecentSearch);
  const clearRecentSearches = usePlayerStore((state) => state.clearRecentSearches);

  const isDark = theme === 'dark';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'albums'>(initialTab);
  const [isFocused, setIsFocused] = useState(false);

  
  const [songsResults, setSongsResults] = useState<Song[]>([]);
  const [artistsResults, setArtistsResults] = useState<Artist[]>([]);
  const [albumsResults, setAlbumsResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  
  const executeSearch = async (searchQuery: string, tab: 'songs' | 'artists' | 'albums') => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    addRecentSearch(searchQuery.trim());

    try {
      if (tab === 'songs') {
        const res = await searchSongs(searchQuery);
        setSongsResults(res.songs);
      } else if (tab === 'artists') {
        const res = await searchArtists(searchQuery);
        setArtistsResults(res.artists);
      } else if (tab === 'albums') {
        const res = await searchAlbums(searchQuery);
        setAlbumsResults(res.albums);
      }
    } catch (e) {
      console.error(e);
      if (tab === 'songs') setSongsResults([]);
      else if (tab === 'artists') setArtistsResults([]);
      else if (tab === 'albums') setAlbumsResults([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmit = () => {
    executeSearch(query, activeTab);
  };

  
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setActiveTab(initialTab);
      executeSearch(initialQuery, initialTab);
    }
  }, [initialQuery, initialTab]);

  
  useEffect(() => {
    if (query.trim() && hasSearched) {
      executeSearch(query, activeTab);
    }
  }, [activeTab]);

  const handleRecentClick = (text: string) => {
    setQuery(text);
    executeSearch(text, activeTab);
  };

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  
  const renderResults = () => {
    if (loading) {
      return (
        <View className="mt-20 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ff8216" />
        </View>
      );
    }

    if (!hasSearched) {
      return renderRecentSearchesSection();
    }

    const isEmpty =
      (activeTab === 'songs' && songsResults.length === 0) ||
      (activeTab === 'artists' && artistsResults.length === 0) ||
      (activeTab === 'albums' && albumsResults.length === 0);

    if (isEmpty) {
      return renderEmptyState();
    }

    if (activeTab === 'songs') {
      return (
        <FlatList
          data={songsResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={(song) => {
                setQueue(songsResults);
                playSong(song);
                navigation.navigate('Player');
              }}
              onOptionsPress={openOptions}
            />
          )}
        />
      );
    }

    if (activeTab === 'artists') {
      return (
        <FlatList
          data={artistsResults}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('ArtistDetail', {
                  artistId: item.id,
                  artistName: item.name,
                  artistImage: item.image,
                })
              }
              className={`mx-1.5 mb-6 flex-1 items-center rounded-3xl p-3 ${
                isDark ? 'bg-slate-900/30' : 'bg-slate-100/40'
              }`}
              style={{ maxWidth: '47%' }}>
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
    }

    if (activeTab === 'albums') {
      return (
        <FlatList
          data={albumsResults}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('AlbumDetail', {
                  albumId: item.id,
                  albumName: item.name,
                  albumImage: item.image,
                  artistName: item.artist,
                })
              }
              className={`mx-1.5 mb-6 flex-1 items-center rounded-3xl p-3 ${
                isDark ? 'bg-slate-900/30' : 'bg-slate-100/40'
              }`}
              style={{ maxWidth: '47%' }}>
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
    }
  };

  
  const renderRecentSearchesSection = () => {
    if (recentSearches.length === 0) {
      return (
        <View className="items-center px-8 py-20">
          <Ionicons name="search-outline" size={50} color={isDark ? '#475569' : '#cbd5e1'} />
          <Text
            className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Search JioSaavn library
          </Text>
          <Text
            className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Search for songs, artists, or albums by typing in the search bar above.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="mt-4 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Searches
          </Text>
          <Pressable onPress={clearRecentSearches}>
            <Text className="text-sm font-bold text-orange-500">Clear All</Text>
          </Pressable>
        </View>

        {recentSearches.map((item, index) => (
          <View
            key={index}
            className={`flex-row items-center justify-between border-b py-3.5 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
            <Pressable onPress={() => handleRecentClick(item)} className="flex-1">
              <Text
                className={`text-base font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {item}
              </Text>
            </Pressable>
            <Pressable onPress={() => removeRecentSearch(item)} className="p-1.5">
              <Ionicons name="close" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    );
  };

  
  const renderEmptyState = () => {
    return (
      <View className="mt-12 flex-1 items-center justify-center px-8">
      
        <View
          className="relative mb-6 h-32 w-32 items-center justify-center rounded-full bg-orange-500"
          style={{
            shadowColor: '#ff8216',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}>
          
          <View className="mb-4 w-14 flex-row justify-between">
            
            <View className="h-2.5 w-4 rotate-12 transform rounded-t-full bg-slate-900" />
            
            <View className="h-2.5 w-4 -rotate-12 transform rounded-t-full bg-slate-900" />
          </View>
          
          <View
            className="absolute h-8 w-12 rounded-t-full bg-slate-900"
            style={{ bottom: 24, transform: [{ rotate: '180deg' }] }}
          />
        </View>

        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Not Found
        </Text>
        <Text
          className={`mt-3 text-center text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Sorry, the keyword you entered cannot be found, please check again or search with another
          keyword.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-2 rounded-full p-2 active:bg-slate-200/20">
          <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
        </Pressable>

        <View
          className={`flex-1 flex-row items-center rounded-full border px-4 ${
            isFocused
              ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10'
              : isDark
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-slate-100'
          }`}
          style={{
            height: 48,
            shadowColor: isFocused ? '#ff8216' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isFocused ? 0.15 : 0.03,
            shadowRadius: 4,
            elevation: isFocused ? 3 : 1,
          }}>
          <Ionicons
            name="search-outline"
            size={20}
            color={isFocused ? '#ff8216' : isDark ? '#94a3b8' : '#64748b'}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={true}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            className={`ml-3 flex-1 text-sm font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{
              paddingVertical: 0,
              height: '100%',
              textAlignVertical: 'center',
            }}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('');
                setHasSearched(false);
              }}
              className="rounded-full p-1 active:bg-slate-200/20">
              <Ionicons name="close-circle" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            </Pressable>
          )}
        </View>
      </View>

      
      <View
        className={`flex-row justify-around border-b ${
          isDark ? 'border-slate-900' : 'border-slate-100'
        }`}
        style={{ height: 45 }}>
        
        <Pressable
          onPress={() => setActiveTab('songs')}
          className="relative flex-1 items-center justify-center">
          <Text
            className={`text-sm font-bold ${
              activeTab === 'songs'
                ? 'text-orange-500'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Songs
          </Text>
          {activeTab === 'songs' && (
            <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500" />
          )}
        </Pressable>

        
        <Pressable
          onPress={() => setActiveTab('artists')}
          className="relative flex-1 items-center justify-center">
          <Text
            className={`text-sm font-bold ${
              activeTab === 'artists'
                ? 'text-orange-500'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Artists
          </Text>
          {activeTab === 'artists' && (
            <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500" />
          )}
        </Pressable>

        
        <Pressable
          onPress={() => setActiveTab('albums')}
          className="relative flex-1 items-center justify-center">
          <Text
            className={`text-sm font-bold ${
              activeTab === 'albums'
                ? 'text-orange-500'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Albums
          </Text>
          {activeTab === 'albums' && (
            <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-orange-500" />
          )}
        </Pressable>
      </View>

      
      <View className="flex-1">{renderResults()}</View>

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}
