import { useAudioPlayer as useExpoAudioPlayer } from 'expo-audio';

export const useAudioPlayer = (audioUrl?: string) => {
  return useExpoAudioPlayer(audioUrl ? { uri: audioUrl } : undefined);
};
