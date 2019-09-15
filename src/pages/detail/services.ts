import Taro from '@tarojs/taro'

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
