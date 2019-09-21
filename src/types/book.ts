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
  url: string;
  image: string;
  summary: string;
  authors?: string;
  publisher?: string;
  rating?: number;
  tags?: string;
  price?: string;
  /** for crawled data */
  abstract?: string;
}
