import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { usePlayerStore } from '../store/playerStore';
import { Song } from '../types/song';
import { useNavigation } from '@react-navigation/native';
import SongOptionsDrawer from '@/components/SongOptionsDrawer';

export default function QueueScreen() {
  const navigation = useNavigation<any>();

  const theme = usePlayerStore((state) => state.theme);
  const playSong = usePlayerStore((state) => state.playSong);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const queue = usePlayerStore((state) => state.queue);
  const reorderQueue = usePlayerStore((state) => state.reorderQueue);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);

  const isDark = theme === 'dark';

  // Options Drawer State
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const openOptions = (song: Song) => {
    setOptionsSong(song);
    setOptionsVisible(true);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Song>) => {
    const isCurrent = currentSong?.id === item.id;

    return (
      <Pressable
        onPress={() => {
          playSong(item);
          navigation.navigate('Player');
        }}
        onLongPress={drag}
        disabled={isActive}
        className={`mb-3 flex-row items-center rounded-2xl border p-3 ${
          isActive
            ? 'border-orange-400 bg-orange-100/50'
            : isCurrent
              ? isDark
                ? 'border-orange-900/40 bg-orange-950/20'
                : 'border-orange-200 bg-orange-50'
              : isDark
                ? 'border-slate-800 bg-slate-900/40'
                : 'border-slate-200 bg-slate-100/40'
        }`}
        style={{
          elevation: isActive ? 4 : 0,
        }}>
        
        <Image
          source={{
            uri: item.image,
          }}
          className="rounded-xl"
          style={{
            width: 50,
            height: 50,
          }}
        />

        
        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className={`text-sm font-bold ${
              isCurrent ? 'text-orange-500' : isDark ? 'text-white' : 'text-slate-950'
            }`}>
            {item.name}
          </Text>

          <Text
            numberOfLines={1}
            className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {item.artist}
          </Text>
        </View>

        
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            openOptions(item);
          }}
          className="mr-1 rounded-full p-2 active:bg-slate-200/20">
          <Ionicons name="ellipsis-vertical" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
        </Pressable>

        
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            removeFromQueue(item.id);
          }}
          className="active:bg-slate-250/20 mr-1 rounded-full p-2">
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>

        
        <Pressable onLongPress={drag} className="p-2">
          <Ionicons name="reorder-three" size={24} color={isDark ? '#475569' : '#cbd5e1'} />
        </Pressable>
      </Pressable>
    );
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
          Play Queue
        </Text>
        <View className="w-10" />
      </View>

      
      <View className="mb-2 px-6 py-2">
        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Hold and drag the <Ionicons name="reorder-three" size={14} /> handle to reorder the
          tracks.
        </Text>
      </View>

      
      <View className="flex-1 px-4">
        <DraggableFlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => {
            reorderQueue(data);
          }}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListEmptyComponent={() => (
            <View className="items-center px-8 py-20">
              <Ionicons
                name="musical-notes-outline"
                size={54}
                color={isDark ? '#475569' : '#cbd5e1'}
              />

              <Text
                className={`mt-4 text-center text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Queue is Empty
              </Text>

              <Text
                className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Search for tracks on the Home Screen to populate the play queue.
              </Text>
            </View>
          )}
        />
      </View>

      
      <SongOptionsDrawer
        visible={optionsVisible}
        song={optionsSong}
        onClose={() => setOptionsVisible(false)}
      />
    </SafeAreaView>
  );
}
