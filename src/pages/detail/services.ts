import Taro from '@tarojs/taro'
import { ShortComment } from '../../types/comment'

const db = Taro.cloud.database()

export async function getBookDetailByIsbn(isbn: string) {
  const { data } = await db
    .collection('books')
    .where({ isbn })
    .get()
  return data[0] as {
    _id: string;
    isbn: string;
    title: string;
    authors?: string;
    publisher?: string;
    url: string;
    rating: number;
    image: string;
    summary: string;
    tags?: string;
    price?: string;
  }
}

/**
 * @param _id // TODO 替换云开发默认ID
 */
export async function incBookClickCount (_id: string) {
  const _ = db.command
  await db.collection('books').doc(_id).update({
    data: { count: _.inc(1) }
  })
}

export async function getCommentsByDoubanBookUrl (url: string) {
  const doubanId = url.split('/').filter(e => e).pop()
  const { data } = await Taro.request({
    url: 'https://m.douban.com/rexxar/api/v2/book/' + doubanId +
      '/interests?count=4&order_by=hot&start=0&ck=&for_mobile=1'
  })
  const comments = data.interests.map((e: any) => {
    e.rating = e.rating ? e.rating.value : e.rating
    e.likes = e.vote_count
    return e
  }) as ShortComment[]
  return comments
}
