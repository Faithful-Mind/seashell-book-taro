import Taro from '@tarojs/taro'
import { TopSwiperBook, ListBook } from '../types/book'

const db = Taro.cloud.database()

export async function getTops() {
  const { data } = await db
    .collection('books')
    .field({ image: true, isbn: true })
    .orderBy('count', 'desc')
    .limit(9)
    .get()
  return data as TopSwiperBook[]
}

export async function getBookList(page = 0, size = 10) {
  const { data } = await db
    .collection('books')
    .field({
      title: true,
      authors: true,
      publisher: true,
      rating: true,
      count: true,
      image: true,
      isbn: true
    })
    .orderBy('createdAt', 'desc')
    .skip(page * size)
    .limit(size)
    .get()
  return data as ListBook[]
}
