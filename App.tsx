import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import AppNavigator from './src/navigation/AppNavigator';
import { usePlayerStore } from './src/store/playerStore';

import './global.css';
import AudioManager from '@/components/AudioManager';

const queryClient = new QueryClient();

function AppContent() {
  const loadStoredQueue = usePlayerStore((state) => state.loadStoredQueue);
  const loadStoredDownloads = usePlayerStore((state) => state.loadStoredDownloads);
  const loadStoredMetadata = usePlayerStore((state) => state.loadStoredMetadata);

  useEffect(() => {
    loadStoredQueue();
    loadStoredDownloads();
    loadStoredMetadata();
  }, [loadStoredQueue, loadStoredDownloads, loadStoredMetadata]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AudioManager />
            <AppContent />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
