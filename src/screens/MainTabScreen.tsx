import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '@/store/playerStore';


import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import PlaylistsScreen from './PlaylistsScreen';
import SettingsScreen from './SettingsScreen';
import MiniPlayer from '@/components/MiniPlayer';

export default function MainTabScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'playlists' | 'settings'>(
    'home'
  );
  const theme = usePlayerStore((state) => state.theme);
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="flex-1">{renderActiveScreen()}</View>

      
      <MiniPlayer />

      
      <View
        className={`flex-row items-center justify-around border-t ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
        style={{
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        }}>
        
        <Pressable
          onPress={() => setActiveTab('home')}
          className="flex-1 items-center justify-center py-1">
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? '#ff8216' : isDark ? '#94a3b8' : '#64748b'}
          />
          <Text
            className={`mt-1 text-[10px] font-medium ${
              activeTab === 'home' ? 'text-[#ff8216]' : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
            Home
          </Text>
        </Pressable>

        
        <Pressable
          onPress={() => setActiveTab('favorites')}
          className="flex-1 items-center justify-center py-1">
          <Ionicons
            name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
            size={22}
            color={activeTab === 'favorites' ? '#ff8216' : isDark ? '#94a3b8' : '#64748b'}
          />
          <Text
            className={`mt-1 text-[10px] font-medium ${
              activeTab === 'favorites'
                ? 'text-[#ff8216]'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Favorites
          </Text>
        </Pressable>

        
        <Pressable
          onPress={() => setActiveTab('playlists')}
          className="flex-1 items-center justify-center py-1">
          <Ionicons
            name={activeTab === 'playlists' ? 'list' : 'list-outline'}
            size={22}
            color={activeTab === 'playlists' ? '#ff8216' : isDark ? '#94a3b8' : '#64748b'}
          />
          <Text
            className={`mt-1 text-[10px] font-medium ${
              activeTab === 'playlists'
                ? 'text-[#ff8216]'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Playlists
          </Text>
        </Pressable>

        
        <Pressable
          onPress={() => setActiveTab('settings')}
          className="flex-1 items-center justify-center py-1">
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'settings' ? '#ff8216' : isDark ? '#94a3b8' : '#64748b'}
          />
          <Text
            className={`mt-1 text-[10px] font-medium ${
              activeTab === 'settings'
                ? 'text-[#ff8216]'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}>
            Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
