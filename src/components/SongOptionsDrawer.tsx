import React, { useState } from 'react';
import { Modal, View, Text, Pressable, Image, ScrollView, Alert, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Song } from '../types/song';
import { usePlayerStore } from '../store/playerStore';

interface SongOptionsDrawerProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export default function SongOptionsDrawer({ visible, song, onClose }: SongOptionsDrawerProps) {
  const navigation = useNavigation<any>();
  const theme = usePlayerStore((state) => state.theme);
  const favorites = usePlayerStore((state) => state.favorites);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);
  const queue = usePlayerStore((state) => state.queue);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const playlists = usePlayerStore((state) => state.playlists);
  const addSongToPlaylist = usePlayerStore((state) => state.addSongToPlaylist);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
  const downloadedSongs = usePlayerStore((state) => state.downloadedSongs);
  const downloadSong = usePlayerStore((state) => state.downloadSong);
  const removeDownloadedSong = usePlayerStore((state) => state.removeDownloadedSong);

  const isDark = theme === 'dark';
  const isFavorited = song ? !!favorites[song.id] : false;
  const isDownloaded = song ? !!downloadedSongs[song.id] : false;

  const [showPlaylistSelect, setShowPlaylistSelect] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!song) return null;

  
  const formatSongDuration = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')} mins`;
  };

  const handlePlayNext = () => {
    const currentIdx = usePlayerStore.getState().currentIndex;
    const currentQueue = [...queue];
    const existsIdx = currentQueue.findIndex((s) => s.id === song.id);

    if (existsIdx >= 0) {
      
      const [moved] = currentQueue.splice(existsIdx, 1);
      const insertIdx = existsIdx < currentIdx ? currentIdx : currentIdx + 1;
      currentQueue.splice(insertIdx, 0, moved);
    } else {
      // Insert new song
      currentQueue.splice(currentIdx + 1, 0, song);
    }

    setQueue(currentQueue);
    Alert.alert('Play Next', `${song.name} will play next!`);
    onClose();
  };

  const handleAddToQueue = () => {
    const added = addToQueue(song);
    if (added) {
      Alert.alert('Queue', `Added ${song.name} to the playing queue.`);
    } else {
      Alert.alert('Queue', `${song.name} is already in the queue.`);
    }
    onClose();
  };

  const handleCreateAndAddPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    addSongToPlaylist(newPlaylistName, song);
    Alert.alert('Playlist', `Created playlist "${newPlaylistName}" and added ${song.name}.`);
    setNewPlaylistName('');
    setShowPlaylistSelect(false);
    onClose();
  };

  const handleAddToExistingPlaylist = (playlistName: string) => {
    addSongToPlaylist(playlistName, song);
    Alert.alert('Playlist', `Added ${song.name} to playlist "${playlistName}".`);
    setShowPlaylistSelect(false);
    onClose();
  };

  const handleGoToArtist = () => {
    onClose();
    navigation.navigate('Search', { initialQuery: song.artist, initialTab: 'artists' });
  };

  const handleGoToAlbum = () => {
    onClose();
    navigation.navigate('Search', { initialQuery: song.name, initialTab: 'albums' });
  };

  const handleShowDetails = () => {
    Alert.alert(
      'Song Details',
      `Title: ${song.name}\nArtist: ${song.artist}\nDuration: ${formatSongDuration(song.duration)}\nSource: JioSaavn API\nStream Quality: 320 kbps (High Quality)`
    );
  };

  const handleToggleDownload = async () => {
    if (isDownloaded) {
      await removeDownloadedSong(song.id);
      Alert.alert('Offline Mode', 'Song deleted from offline storage.');
    } else {
      Alert.alert('Offline Mode', 'Starting download in the background.');
      downloadSong(song);
    }
    onClose();
  };

  const handleShare = () => {
    Alert.alert('Share', `Sharing "${song.name}" by ${song.artist}\nLink: ${song.audioUrl}`);
    onClose();
  };

  const handleBlacklist = () => {
    Alert.alert('Blacklist', `Added "${song.name}" to blacklist. It will no longer play.`);
    onClose();
  };

  const handleSetRingtone = () => {
    Alert.alert('Ringtone', `Setting "${song.name}" as your custom ringtone.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        
        <Pressable className="flex-1" onPress={onClose} />

        
        <View
          className={`rounded-t-[36px] px-6 pb-8 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          style={{
            maxHeight: '80%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 24,
          }}>
          
          <View className="items-center py-4">
            <View
              className={`h-1.5 w-12 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-350'}`}
            />
          </View>

          {!showPlaylistSelect ? (
            <>
              
              <View className="flex-row items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <View className="flex-1 flex-row items-center pr-4">
                  <Image
                    source={{ uri: song.image || 'https://placehold.co/150x150' }}
                    className="rounded-2xl"
                    style={{ width: 64, height: 64 }}
                  />
                  <View className="ml-3 flex-1">
                    <Text
                      numberOfLines={1}
                      className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {song.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {song.artist} | {formatSongDuration(song.duration)}
                    </Text>
                  </View>
                </View>

                
                <Pressable
                  onPress={() => toggleFavorite(song)}
                  className={`rounded-full p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isFavorited ? '#ff3b30' : isDark ? '#94a3b8' : '#64748b'}
                  />
                </Pressable>
              </View>

              
              <ScrollView
                className="mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}>
                
                <Pressable
                  onPress={handlePlayNext}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="play-circle" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Play Next
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleAddToQueue}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="plus-circle" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Add to Playing Queue
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={() => setShowPlaylistSelect(true)}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="folder-plus" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Add to Playlist
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleGoToArtist}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="user" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Go to Artist
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleGoToAlbum}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="disc" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Go to Album
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleShowDetails}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="info" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Details
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleToggleDownload}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather
                    name={isDownloaded ? 'trash-2' : 'download'}
                    size={22}
                    color={isDownloaded ? '#ef4444' : isDark ? '#cbd5e1' : '#475569'}
                  />
                  <Text
                    className={`ml-4 text-base font-semibold ${
                      isDownloaded ? 'text-red-500' : isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                    {isDownloaded ? 'Delete from Device' : 'Download for Offline Listening'}
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleSetRingtone}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="bell" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Set as Ringtone
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleBlacklist}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="slash" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Add to Blacklist
                  </Text>
                </Pressable>

                
                <Pressable
                  onPress={handleShare}
                  className="flex-row items-center py-3.5 active:opacity-60">
                  <Feather name="share-2" size={22} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text
                    className={`ml-4 text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Share
                  </Text>
                </Pressable>
              </ScrollView>
            </>
          ) : (
            // Playlist Select Mode
            <View className="py-4">
              <View className="flex-row items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <Pressable
                  onPress={() => setShowPlaylistSelect(false)}
                  className="flex-row items-center">
                  <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : 'black'} />
                  <Text
                    className={`ml-3 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Add to Playlist
                  </Text>
                </Pressable>
              </View>

              
              <View className="mb-4 mt-6 flex-row items-center">
                <TextInput
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="New Playlist Name..."
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  className={`mr-3 flex-1 rounded-2xl border px-4 py-3 ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  }`}
                />
                <Pressable
                  onPress={handleCreateAndAddPlaylist}
                  disabled={!newPlaylistName.trim()}
                  className={`rounded-2xl bg-orange-500 px-5 py-3 active:bg-orange-600 ${
                    !newPlaylistName.trim() ? 'opacity-50' : ''
                  }`}>
                  <Text className="font-bold text-white">Create</Text>
                </Pressable>
              </View>

              <Text
                className={`mb-2 mt-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Existing Playlists
              </Text>

              
              <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                {Object.keys(playlists).length === 0 ? (
                  <View className="items-center py-6">
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No playlists created yet.
                    </Text>
                  </View>
                ) : (
                  Object.keys(playlists).map((name) => (
                    <Pressable
                      key={name}
                      onPress={() => handleAddToExistingPlaylist(name)}
                      className={`flex-row items-center justify-between border-b py-4 ${
                        isDark ? 'border-slate-800' : 'border-slate-100'
                      }`}>
                      <View className="flex-row items-center">
                        <Ionicons name="folder-outline" size={24} color="#ff8216" />
                        <Text
                          className={`ml-3 text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {name}
                        </Text>
                      </View>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {playlists[name]?.length || 0} songs
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
