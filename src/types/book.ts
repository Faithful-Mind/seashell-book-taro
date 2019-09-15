export interface ListBook {
  title: string;
  authors: string;
  publisher: string;
  rating: number;
  count: number;
  image: string;
  isbn: string;
}

export type TopSwiperBook = {
  image: string;
  isbn: string;
}

export interface BookInfoBook {
  title: string;
  authors?: string;
  publisher?: string;
  rating: number;
  image: string;
  /** for crawled data */
  abstract?: string;
  summary: string;
  tags?: string | [string];
  price?: string;
}
