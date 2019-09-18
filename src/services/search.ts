import { BookResult } from "../types/search"

/**
 * Similar to {@link String#indexOf}, but returns Infinity if not found.
 * @param toIndex the string to index
 * @param searchString the value to search
 */
export function indexOf (toIndex: string, searchString: string, fromIndex = 0) {
  const stringIndex = toIndex.indexOf(searchString, fromIndex)
  return stringIndex === -1 ? Infinity : stringIndex
}

export function parseSearchResults (bodyString: string) {
  const linkRegex = /<a href="\/book\/subject\/(.+)\//g
  const imgRegex = /<img src="(https+:\/\/img.+)"\s*\/>/g
  const titleRegex = /<span class="subject-title">(.+)<\/span>/g
  const ratingRegex = /<span class="rating-stars" data-rating="([\d.]+)">/g
  var urlIdRes
  var results = []
  var idxNoRating = Math.min(
    indexOf(bodyString, '评价人数不足'),
    indexOf(bodyString, '目前无人评价')
  )

  urlIdRes = linkRegex.exec(bodyString)
  while (urlIdRes) {
    if (linkRegex.lastIndex > idxNoRating) {
      // 说明上次的rating实际为无评分，并误将此次要用的收入
      delete results.slice(-1)[0].rating
      ratingRegex.lastIndex = linkRegex.lastIndex
      idxNoRating = Math.min(
        indexOf(bodyString, '评价人数不足', linkRegex.lastIndex),
        indexOf(bodyString, '目前无人评价', linkRegex.lastIndex)
      )
    }
    imgRegex.lastIndex = linkRegex.lastIndex // img 条件稍宽泛，收缩一下
    const toPush: BookResult = {
      url: 'https://book.douban.com/subject/' + urlIdRes[1] + '/',
      image: imgRegex.exec(bodyString)![1],
      title: titleRegex.exec(bodyString)![1],
    }
    const ratingRes = ratingRegex.exec(bodyString)
    if (ratingRes) toPush.rating = Number(ratingRes[1]) / 10
    results.push(toPush)

    urlIdRes = linkRegex.exec(bodyString)
  }
  return results
}
