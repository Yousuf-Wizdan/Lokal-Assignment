import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, Modal, TextInput, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { Song } from '@/types/song';
import SongCard from '@/components/SongCard';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function PlaylistsScreen() {
  const navigation = useNavigation<any>();
  const theme = usePlayerStore((state) => state.theme);
  const playlists = usePlayerStore((state) => state.playlists);
  const playSong = usePlayerStore((state) => state.playSong);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
  const deletePlaylist = usePlayerStore((state) => state.deletePlaylist);
  const removeSongFromPlaylist = usePlayerStore((state) => state.removeSongFromPlaylist);

  const isDark = theme === 'dark';

  
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string | null>(null);

  
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) return;
    createPlaylist(playlistName.trim());
    setPlaylistName('');
    setModalVisible(false);
    Alert.alert('Playlists', `Playlist "${playlistName.trim()}" created successfully!`);
  };

  const handleDeletePlaylist = (name: string) => {
    Alert.alert('Delete Playlist', `Are you sure you want to delete the playlist "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePlaylist(name);
          setSelectedPlaylistName(null);
        },
      },
    ]);
  };

  const handlePlayPlaylist = (list: Song[]) => {
    if (list.length === 0) return;
    setQueue(list);
    playSong(list[0]);
    navigation.navigate('Player');
  };

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  
  if (selectedPlaylistName) {
    const playlistSongs = playlists[selectedPlaylistName] || [];

    return (
      <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        
        <View className="flex-row items-center justify-between border-b border-transparent px-6 py-3">
          <Pressable
            onPress={() => setSelectedPlaylistName(null)}
            className="flex-row items-center rounded-full bg-slate-500/5 p-2 active:scale-95 dark:bg-slate-800/40">
            <Ionicons name="arrow-back" size={20} color={isDark ? '#e2e8f0' : '#475569'} />
            <Text
              className={`ml-1.5 pr-2 text-sm font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Back
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleDeletePlaylist(selectedPlaylistName)}
            className="rounded-full bg-red-500/10 p-2 active:scale-95">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>

        
        <View className="items-center px-6 py-6">
          <View
            className="mb-4 overflow-hidden rounded-[28px] bg-slate-200 dark:bg-slate-800"
            style={{
              width: 120,
              height: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.3 : 0.08,
              shadowRadius: 10,
              elevation: 4,
            }}>
            {playlistSongs.length > 0 ? (
              <Image
                source={{ uri: playlistSongs[0].image || 'https://placehold.co/150x150' }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-orange-500/10 dark:bg-orange-500/20">
                <Ionicons name="musical-notes" size={48} color="#f97316" />
              </View>
            )}
          </View>
          <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
            {selectedPlaylistName}
          </Text>
          <Text className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Playlist | {playlistSongs.length} Tracks
          </Text>

          {playlistSongs.length > 0 && (
            <Pressable
              onPress={() => handlePlayPlaylist(playlistSongs)}
              className="mt-5 flex-row items-center justify-center rounded-full bg-orange-500 px-8 py-3 active:scale-95"
              style={{
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <Ionicons name="play" size={16} color="white" />
              <Text className="ml-2 text-sm font-extrabold tracking-wide text-white">
                PLAY PLAYLIST
              </Text>
            </Pressable>
          )}
        </View>

        
        <FlatList
          data={playlistSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={(song) =>
                handlePlayPlaylist([song, ...playlistSongs.filter((s) => s.id !== song.id)])
              }
              onOptionsPress={openOptions}
            />
          )}
          ListEmptyComponent={() => (
            <View className="items-center px-8 py-20">
              <Ionicons
                name="musical-notes-outline"
                size={50}
                color={isDark ? '#475569' : '#cbd5e1'}
              />
              <Text
                className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Empty Playlist
              </Text>
              <Text
                className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Add tracks to this playlist by tapping the options button on any song card.
              </Text>
            </View>
          )}
        />

      
        <SongOptionsDrawer
          visible={optionsVisible}
          song={optionsSong}
          onClose={() => setOptionsVisible(false)}
        />
      </SafeAreaView>
    );
  }

  const playlistsArray = Object.keys(playlists);

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
        <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
          Playlists
        </Text>

        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center rounded-full bg-orange-500 px-4 py-2 active:scale-95"
          style={{
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Ionicons name="add" size={18} color="white" />
          <Text className="ml-1 text-xs font-black text-white">New Playlist</Text>
        </Pressable>
      </View>

      
      <ScrollView
        className="mt-3 flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {playlistsArray.length === 0 ? (
          <View className="items-center px-8 py-24">
            <Ionicons name="folder-outline" size={54} color={isDark ? '#475569' : '#cbd5e1'} />
            <Text
              className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No Playlists Created
            </Text>
            <Text
              className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Tap the {"'New Playlist'"} button at the top or choose {"'Add to Playlist'"} on any
              song to create a playlist.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between px-1">
            {playlistsArray.map((name) => (
              <Pressable
                key={name}
                onPress={() => setSelectedPlaylistName(name)}
                className="mb-6 w-[47%] active:scale-[0.98]">
                
                <View
                  className="relative w-full aspect-square overflow-hidden rounded-[24px] bg-slate-200 dark:bg-slate-800"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.22 : 0.03,
                    shadowRadius: 8,
                    elevation: 2,
                  }}>
                  {playlists[name] && playlists[name].length > 0 ? (
                    <Image
                      source={{ uri: playlists[name][0].image || 'https://placehold.co/150x150' }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-orange-500/10 dark:bg-orange-500/20">
                      <Ionicons name="musical-notes" size={32} color="#f97316" />
                    </View>
                  )}

                  
                  {playlists[name] && playlists[name].length > 0 && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePlayPlaylist(playlists[name]);
                      }}
                      className="absolute bottom-3 right-3 h-8 w-8 items-center justify-center rounded-full bg-orange-500 shadow-md shadow-orange-500/40 active:scale-90"
                      style={{
                        shadowColor: '#f97316',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 3,
                        elevation: 3,
                      }}>
                      <Ionicons name="play" size={14} color="white" style={{ marginLeft: 2 }} />
                    </Pressable>
                  )}
                </View>

                
                <View className="mt-2.5 px-1">
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-extrabold tracking-wide ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                    {name}
                  </Text>
                  <Text className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-450">
                    {playlists[name]?.length || 0}{' '}
                    {playlists[name]?.length === 1 ? 'Track' : 'Tracks'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          onPress={() => setModalVisible(false)}
          className="flex-1 items-center justify-center bg-black/60 px-8">
          <View
            className={`w-full rounded-[32px] p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 16,
            }}>
            <Text className={`mb-4 text-lg font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              New Playlist
            </Text>

            <TextInput
              value={playlistName}
              onChangeText={setPlaylistName}
              placeholder="Enter playlist name..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              className={`mb-6 w-full rounded-full border-0 px-4 py-3 text-sm font-semibold ${
                isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
              }`}
              style={{ height: 48 }}
              autoFocus
            />

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => {
                  setPlaylistName('');
                  setModalVisible(false);
                }}
                className="mr-2 rounded-full px-5 py-2.5 active:bg-slate-100/50 dark:active:bg-slate-800/50">
                <Text className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCreatePlaylist}
                disabled={!playlistName.trim()}
                className={`rounded-full bg-orange-500 px-6 py-2.5 active:bg-orange-600 ${
                  !playlistName.trim() ? 'opacity-50' : ''
                }`}>
                <Text className="font-bold text-white">Create</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
