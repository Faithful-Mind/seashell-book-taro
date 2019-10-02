import Taro from '@tarojs/taro'
import { ListBook } from '../types/book'

const db = Taro.cloud.database()

export async function addBookByIsbn (isbn: string) {
  const { total: already } = await db
    .collection('books')
    .where({ isbn })
    .count()
  if (already) throw new Error('图书已存在')

  const { result } = await Taro.cloud.callFunction({
    name: 'douban',
    data: { isbn }
  })
  console.log('爬得：', result)

  const addRes = await db.collection('books').add({
    data: {
      ...result,
      count: 0,
      createdAt: db.serverDate()
    }
  }) as Taro.cloud.DB.IAddResult
  console.log(addRes)
  return { _id: addRes._id, title: result.title }
}

export async function getBooksByOpenId(openId: string, page = 0, size = 10) {
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
    .where({
      _openid: openId
    })
    .orderBy('createdAt', 'desc')
    .skip(page * size)
    .limit(size)
    .get()
  return data as ListBook[]
}
