import Taro from '@tarojs/taro'
import { parse } from 'node-html-parser'

import { ShortComment } from '../types/comment'
import { _try } from '../utils'

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

export async function fetchDetailByUrl (url:string) {
  const doubanId = url.split('/').filter(e => e).pop()
  const { data } = await Taro.request(
    {
      url: 'https://m.douban.com/book/subject/' + doubanId + '/',
      header: { 'Content-Type': 'text/html' },
      dataType: 'text/html',
    }
  )
  const bookInfo = parseBookDOM(data)
  if (!bookInfo.title || !bookInfo.abstract) {
    console.warn('DOM parse failed:', bookInfo)
  }
  return bookInfo
}

type BookDetail = {
  title: string;
  image?: string;
  summary?: string;
  rating?: number;
  abstract?: string;
  tags?: string;
}

/**
 * Parse book info by DOM manipulation
 */
function parseBookDOM (bodyString: string) {
  const doc = parse(bodyString, 'text/html')

  /** simulate
   * `$('[property="weixin:timeline_title"]').prop('content').slice(0, -5)`
   */
  const title = doc.querySelector('[property="weixin:timeline_title"]')
    .attributes['content'].slice(0, -5)

  /** simulate `$('.sub-cover img').prop('src')` */
  const image = _try(
    () => doc.querySelector('.sub-cover img').attributes['src'],
    undefined
  )

  /** simulate `$('[itemprop="ratingValue"]').prop('content')` */
  const rating = _try(
    () => doc.querySelector('[itemprop="ratingValue"]').attributes['content'],
    undefined
  )

  /** simulate `$('.sub-meta').text()` */
  const abstract = _try(
    () => doc.querySelector('.sub-meta').text.replace(/\s*\n\s*/g, ' ').trim(),
    undefined
  )

  /** simulate `$('p.section-intro_desc').find('br').replaceWith('\n').text()` */
  const summary = _try(
    () => {
      const summaryEle = doc.querySelector('p.section-intro_desc')
      // remove unnecessary line breaks
      const summaryHTMLOneLine = summaryEle.innerHTML.replace(/\s*\n\s*/g, ' ')
      // preserve <br/> as line breaks
      const summaryNewEle = parse(
        '<div>' + summaryHTMLOneLine.replace(/\s*<br\s*\/*>\s*/g, '\n') + '</div>'
      ).querySelector('div')
      return summaryNewEle.text.trim()
    },
    undefined
  )

  const bookInfo: BookDetail = { title }
  if (image) bookInfo.image = image
  if (rating) bookInfo.rating = Number(rating)
  if (abstract) bookInfo.abstract = abstract
  if (summary) bookInfo.summary = summary
  return bookInfo
}
