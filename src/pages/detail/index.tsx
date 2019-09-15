import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './detail.scss'

import { BookInfoBook } from '../../types/book'
import { getBookDetailByIsbn, incBookClickCount } from './services'
import BookInfo from '../../components/book-info'

export default class Detail extends Component<{}, {
  /** TODO 替换云开发默认ID */
  bookInfo: BookInfoBook & { _id: string };
}> {

  async componentWillMount () {
    const { isbn = '' } = this.$router.params
    this.setState(
      {
        bookInfo: await getBookDetailByIsbn(isbn)
      },
      () => incBookClickCount(this.state.bookInfo._id)
    )
  }

  render () {
    return (
      <View>
        <BookInfo info={this.state.bookInfo} />
      </View>
    )
  }
}
