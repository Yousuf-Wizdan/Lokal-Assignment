export interface Song {
  id: string;
  name: string;
  image: string;
  artist: string;
  duration: number;
  audioUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  songCount?: number;
  albumCount?: number;
}

export interface Album {
  id: string;
  name: string;
  image: string;
  artist: string;
  year?: string;
  songCount?: number;
}
