import React, { useState } from 'react';
import { View, Text, Pressable, Switch, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePlayerStore } from '@/store/playerStore';

export default function SettingsScreen() {
  const theme = usePlayerStore((state) => state.theme);
  const toggleTheme = usePlayerStore((state) => state.toggleTheme);
  const downloadedSongs = usePlayerStore((state) => state.downloadedSongs);
  const removeDownloadedSong = usePlayerStore((state) => state.removeDownloadedSong);

  const isDark = theme === 'dark';
  const downloadsCount = Object.keys(downloadedSongs).length;

  const audioQuality = usePlayerStore((state) => state.audioQuality);
  const setAudioQuality = usePlayerStore((state) => state.setAudioQuality);
  const [showQualityModal, setShowQualityModal] = useState(false);

  const handleClearDownloads = () => {
    if (downloadsCount === 0) {
      Alert.alert('Settings', 'No offline downloads to clear.');
      return;
    }

    Alert.alert(
      'Clear Offline Tracks',
      `Are you sure you want to delete all ${downloadsCount} downloaded songs from this device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const ids = Object.keys(downloadedSongs);
            for (const id of ids) {
              await removeDownloadedSong(id);
            }
            Alert.alert('Settings', 'All downloads cleared successfully!');
          },
        },
      ]
    );
  };

  const getQualityLabel = (quality: typeof audioQuality) => {
    switch (quality) {
      case 'standard':
        return 'Standard (96 kbps)';
      case 'high':
        return 'High (160 kbps)';
      case 'extreme':
        return 'Extreme (320 kbps)';
    }
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <View className="px-6 pb-4 pt-2">
        <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
        <Text
          className={`mb-3 ml-2 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Preferences
        </Text>

        <View
          className={`mb-6 overflow-hidden rounded-[28px] ${
            isDark ? 'bg-slate-900/40' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.18 : 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          
          <Pressable
            onPress={toggleTheme}
            className={`flex-row items-center justify-between px-4 py-3.5 active:bg-slate-500/5`}>
            <View className="flex-row items-center">
              <View
                className={`mr-3.5 rounded-2xl p-2.5 ${isDark ? 'bg-purple-950/20' : 'bg-purple-50'}`}>
                <Feather name="moon" size={20} color="#a855f7" />
              </View>
              <Text
                className={`text-base font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: '#fdba74' }}
              thumbColor={isDark ? '#f97316' : '#f8fafc'}
            />
          </Pressable>

          
          <Pressable
            onPress={() => setShowQualityModal(true)}
            className={`flex-row items-center justify-between border-t px-4 py-3.5 active:bg-slate-500/5 ${
              isDark ? 'border-slate-800/30' : 'border-slate-100/60'
            }`}>
            <View className="flex-row items-center">
              <View
                className={`mr-3.5 rounded-2xl p-2.5 ${isDark ? 'bg-orange-950/20' : 'bg-orange-50'}`}>
                <Feather name="headphones" size={20} color="#f97316" />
              </View>
              <Text
                className={`text-base font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Audio Quality
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-1.5 text-sm font-black text-orange-500">
                {audioQuality === 'extreme'
                  ? '320 kbps'
                  : audioQuality === 'high'
                    ? '160 kbps'
                    : '96 kbps'}
              </Text>
              <Feather name="chevron-right" size={16} color={isDark ? '#475569' : '#cbd5e1'} />
            </View>
          </Pressable>
        </View>

        
        <Text
          className={`mb-3 ml-2 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Storage
        </Text>

        <View
          className={`mb-6 overflow-hidden rounded-[28px] ${
            isDark ? 'bg-slate-900/40' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.18 : 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center">
              <View
                className={`mr-3.5 rounded-2xl p-2.5 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50'}`}>
                <Feather name="download" size={20} color="#3b82f6" />
              </View>
              <Text
                className={`text-base font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Offline Downloads
              </Text>
            </View>
            <Text className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
              {downloadsCount} {downloadsCount === 1 ? 'song' : 'songs'}
            </Text>
          </View>

          
          <Pressable
            onPress={handleClearDownloads}
            className={`flex-row items-center border-t px-4 py-3.5 active:bg-red-500/5 ${
              isDark ? 'border-slate-800/30' : 'border-slate-100/60'
            }`}>
            <View className="mr-3.5 rounded-2xl bg-red-500/10 p-2.5 dark:bg-red-950/20">
              <Feather name="trash-2" size={20} color="#ef4444" />
            </View>
            <Text className="text-base font-extrabold text-red-500">Clear All Downloads</Text>
          </Pressable>
        </View>

        
        <Text
          className={`mb-3 ml-2 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          About
        </Text>

        <View
          className={`mb-10 rounded-[28px] p-5 ${isDark ? 'bg-slate-900/40' : 'bg-white'}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.18 : 0.03,
            shadowRadius: 10,
            elevation: 2,
          }}>
          
          <View className="pb-3.5">
            <Text
              className={`text-base font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              LokalPlay
            </Text>
            <Text
              className={`mt-2 text-xs font-semibold leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Lokal React Native Intern Assignment project. Built with Expo, TypeScript, Zustand,
              and styled using NativeWind/Tailwind. Audio streams powered by the JioSaavn API.
            </Text>
          </View>

          
          <View
            className={`flex-row justify-between border-t pt-3.5 ${
              isDark ? 'border-slate-800/30' : 'border-slate-100/60'
            }`}>
            <Text
              className={`text-sm font-semibold ${isDark ? 'text-slate-450' : 'text-slate-650'}`}>
              Version
            </Text>
            <Text className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      
      <Modal
        visible={showQualityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQualityModal(false)}>
        <Pressable
          onPress={() => setShowQualityModal(false)}
          className="flex-1 items-center justify-center bg-black/60 px-8">
          <View
            className={`w-full rounded-[32px] p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.22,
              shadowRadius: 20,
              elevation: 24,
            }}>
            <Text className={`mb-4 text-lg font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Audio Quality
            </Text>

            {(['standard', 'high', 'extreme'] as const).map((quality) => (
              <Pressable
                key={quality}
                onPress={() => {
                  setAudioQuality(quality);
                  setShowQualityModal(false);
                }}
                className="flex-row items-center justify-between py-3.5 active:opacity-60">
                <Text
                  className={`text-base font-semibold ${isDark ? 'text-slate-200' : 'text-slate-750'}`}>
                  {getQualityLabel(quality)}
                </Text>
                {audioQuality === quality ? (
                  <MaterialIcons name="check-circle" size={22} color="#f97316" />
                ) : (
                  <View
                    className={`h-5.5 w-5.5 rounded-full border-2 ${
                      isDark ? 'border-slate-700' : 'border-slate-350'
                    }`}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
