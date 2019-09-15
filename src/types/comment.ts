export interface ShortComment {
  comment: string;
  user: {
    name: string;
    avatar: string;
  };
  likes: number;
  rating?: number;
}
