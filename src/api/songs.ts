import { api } from './client';
import { Song, Artist, Album } from '../types/song';
import { usePlayerStore } from '../store/playerStore';

export const mapSong = (song: any): Song => {
  let imageUrl = '';
  if (song.image) {
    if (Array.isArray(song.image)) {
      const img = song.image[2] || song.image[1] || song.image[0];
      imageUrl = img?.url || img?.link || '';
    } else if (typeof song.image === 'string') {
      imageUrl = song.image;
    }
  }

  let downloadUrl = '';
  if (song.downloadUrl && Array.isArray(song.downloadUrl)) {
    let targetIndex = 4;
    try {
      const quality = usePlayerStore.getState().audioQuality;
      if (quality === 'standard') {
        targetIndex = 2;
      } else if (quality === 'high') {
        targetIndex = 3;
      } else {
        targetIndex = 4;
      }
    } catch (e) {
      targetIndex = 4;
    }

    const download =
      song.downloadUrl[targetIndex] ||
      song.downloadUrl[4] ||
      song.downloadUrl[3] ||
      song.downloadUrl[2] ||
      song.downloadUrl[1] ||
      song.downloadUrl[0];
    downloadUrl = download?.url || download?.link || '';
  } else if (typeof song.downloadUrl === 'string') {
    downloadUrl = song.downloadUrl;
  }

  const artistName =
    song.artists?.primary?.map((artist: any) => artist.name).join(', ') ||
    song.artist ||
    'Unknown Artist';

  return {
    id: song.id,
    name: song.name,
    image: imageUrl,
    artist: artistName,
    duration: Number(song.duration || 0),
    audioUrl: downloadUrl,
  };
};

export const searchSongs = async (query: string, page: number = 1) => {
  try {
    const response = await api.get('/search/songs', {
      params: {
        query,
        page,
      },
    });

    const data = response?.data?.data;

    if (!data || !Array.isArray(data.results)) {
      throw new Error('Invalid API response');
    }

    return {
      songs: data.results.map(mapSong),
      total: data.total || 0,
    };
  } catch (error) {
    console.error('searchSongs failed', error);
    throw error;
  }
};

export const searchArtists = async (query: string, page: number = 1) => {
  try {
    const response = await api.get('/search/artists', {
      params: {
        query,
        page,
      },
    });

    const data = response?.data?.data;

    if (!data || !Array.isArray(data.results)) {
      return { artists: [], total: 0 };
    }

    const artists: Artist[] = data.results.map((artist: any) => {
      let imageUrl = '';
      if (artist.image) {
        if (Array.isArray(artist.image)) {
          const img = artist.image[2] || artist.image[1] || artist.image[0];
          imageUrl = img?.url || img?.link || '';
        } else if (typeof artist.image === 'string') {
          imageUrl = artist.image;
        }
      }
      return {
        id: artist.id,
        name: artist.name,
        image: imageUrl,
      };
    });

    return {
      artists,
      total: data.total || 0,
    };
  } catch (error) {
    console.error('searchArtists failed', error);
    return { artists: [], total: 0 };
  }
};

export const getArtistSongs = async (artistId: string): Promise<Song[]> => {
  try {
    const response = await api.get(`/artists/${artistId}/songs`);
    const data = response?.data?.data;
    if (data) {
      if (Array.isArray(data.songs)) {
        return data.songs.map(mapSong);
      }
      if (Array.isArray(data)) {
        return data.map(mapSong);
      }
      if (Array.isArray(data.results)) {
        return data.results.map(mapSong);
      }
    }
  } catch (e) {
    console.log('Falling back to /artists/{id} endpoint for songs');
  }

  try {
    const response = await api.get(`/artists/${artistId}`);
    const data = response?.data?.data;
    if (data) {
      if (Array.isArray(data.topSongs)) {
        return data.topSongs.map(mapSong);
      }
      if (Array.isArray(data.songs)) {
        return data.songs.map(mapSong);
      }
      if (data.results && Array.isArray(data.results)) {
        return data.results.map(mapSong);
      }
    }
    return [];
  } catch (error) {
    console.error('getArtistSongs failed', error);
    return [];
  }
};

export const searchAlbums = async (query: string, page: number = 1) => {
  try {
    const response = await api.get('/search/albums', {
      params: {
        query,
        page,
      },
    });

    const data = response?.data?.data;

    if (!data || !Array.isArray(data.results)) {
      return { albums: [], total: 0 };
    }

    const albums: Album[] = data.results.map((album: any) => {
      let imageUrl = '';
      if (album.image) {
        if (Array.isArray(album.image)) {
          const img = album.image[2] || album.image[1] || album.image[0];
          imageUrl = img?.url || img?.link || '';
        } else if (typeof album.image === 'string') {
          imageUrl = album.image;
        }
      }
      return {
        id: album.id,
        name: album.name,
        image: imageUrl,
        artist: album.artist || 'Various Artists',
        year: album.year,
      };
    });

    return {
      albums,
      total: data.total || 0,
    };
  } catch (error) {
    console.error('searchAlbums failed', error);
    return { albums: [], total: 0 };
  }
};

export const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  try {
    const response = await api.get('/albums', {
      params: { id: albumId },
    });
    const data = response?.data?.data;
    if (data) {
      if (Array.isArray(data.songs)) {
        return data.songs.map(mapSong);
      }
    }
  } catch (e) {
    console.log('Falling back to /albums/{id} endpoint');
  }

  try {
    const response = await api.get(`/albums/${albumId}`);
    const data = response?.data?.data;
    if (data) {
      if (Array.isArray(data.songs)) {
        return data.songs.map(mapSong);
      }
      if (Array.isArray(data)) {
        return data.map(mapSong);
      }
    }
    return [];
  } catch (error) {
    console.error('getAlbumSongs failed', error);
    return [];
  }
};
