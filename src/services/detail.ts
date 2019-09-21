import Taro from '@tarojs/taro'
import DOMParser from 'dom-parser'

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
  const parser = new DOMParser()
  const doc: Document = parser.parseFromString(bodyString, 'text/html')

  /** simulate
   * `$('meta[property="weixin:timeline_title"]').prop('content').slice(0, -5)`
   */
  const title = Array.from(doc.getElementsByTagName('meta'))
    .filter(e => e.getAttribute('property') === "weixin:timeline_title")[0]
    .getAttribute('content')!.slice(0, -5)

  /** simulate `$('.sub-cover img').prop('src')` */
  const image = _try(
    () => doc.getElementsByClassName('sub-cover')[0]
      .getElementsByTagName('img')[0].getAttribute('src'),
    undefined
  )

  /** simulate `$('meta[itemprop="ratingValue"]').prop('content')` */
  const rating = _try(
    () => Array.from(doc.getElementsByTagName('meta'))
      .filter(e => e.getAttribute('itemprop') === "ratingValue")[0]
      .getAttribute('content'),
    undefined
  )

  /** simulate `$('.sub-meta').text()` */
  const abstract = _try(
    () => doc.getElementsByClassName('sub-meta')[0]
      .textContent!.replace(/\s*\n\s*/g, ' ').trim(),
    undefined
  )

  /** simulate `$('p.section-intro_desc').find('br').replaceWith('\n').text()` */
  const summary = _try(
    () => {
      const summaryRes = Array.from(doc.getElementsByClassName('section-intro_desc'))
        .filter(ele => ele.nodeName === 'p')[0]
      // remove unnecessary line breaks
      const summaryHTMLOneLine = summaryRes.innerHTML.replace(/\s*\n\s*/g, ' ')
      // preserve <br/> as line breaks
      const summaryNewEle = parser.parseFromString(
        '<div>' + summaryHTMLOneLine.replace(/\s*<br\s*\/*>\s*/g, '\n') + '</div>'
      ).getElementsByTagName('div')[0]
      return summaryNewEle.textContent.trim()
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
