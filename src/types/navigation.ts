export type RootStackParamList = {
  Main: undefined;
  Player: undefined;
  Queue: undefined;
  ArtistDetail: { artistId: string; artistName: string; artistImage: string };
  AlbumDetail: { albumId: string; albumName: string; albumImage: string; artistName: string };
  Search: undefined;
};
