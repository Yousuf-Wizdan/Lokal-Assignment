import { usePlayerStore } from '../store/playerStore';

export function usePlayerController() {
  const playSong = usePlayerStore((state) => state.playSong);
  const pause = usePlayerStore((state) => state.pause);
  const resume = usePlayerStore((state) => state.resume);
  const seek = usePlayerStore((state) => state.seek);

  return {
    playSong,
    pause,
    resume,
    seek,
  };
}
