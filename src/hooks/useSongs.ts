import { useInfiniteQuery } from '@tanstack/react-query';
import { searchSongs } from '../api/songs';

export const useSongs = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['songs', query],

    queryFn: ({ pageParam = 1 }) => searchSongs(query, pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const loadedSongs = allPages.flatMap((page) => page.songs).length;

      return loadedSongs < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
};
