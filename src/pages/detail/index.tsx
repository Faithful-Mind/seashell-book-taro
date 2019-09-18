import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './detail.scss'

import { BookInfoBook } from '../../types/book'
import { ShortComment } from '../../types/comment'
import {
  getBookDetailByIsbn,
  incBookClickCount,
  getCommentsByDoubanBookUrl
} from '../../services/detail'
import BookInfo from '../../components/book-info'
import CommentsSection from '../../components/comments-section'

export default class Detail extends Component<{}, {
  /** TODO 替换云开发默认ID */
  bookInfo: BookInfoBook & { _id?: string };
  comments: ShortComment[];
}> {

  constructor (props: {} | undefined) {
    super(props)
    this.state = {
      bookInfo: { title: '', url: '', rating: 0, image: '', summary: '' },
      comments: [],
    }
    this.handleGetComments = this.handleGetComments.bind(this)
  }

  async componentWillMount () {
    const { isbn = '' } = this.$router.params
    this.setState(
      {
        bookInfo: await getBookDetailByIsbn(isbn),
      },
      () =>
        this.state.bookInfo._id && incBookClickCount(this.state.bookInfo._id)
    )
  }

  async onReachBottom () {
    await this.handleGetComments()
  }

  async handleGetComments () {
    if (this.state.comments.length === 0) {
      this.setState({
        comments: [{ user: {}, comment: '加载中' }] as ShortComment[]
      })
      this.setState({
        comments: await getCommentsByDoubanBookUrl(this.state.bookInfo.url)
      })
    }
  }

  render () {
    return (
      <View>
        <BookInfo info={this.state.bookInfo} />
        {this.state.comments.length === 0 ? (
          <View className='hint' onClick={this.handleGetComments}>
            点击或下滑以获取评论
          </View>
        ) : (
          <CommentsSection comments={this.state.comments} />
        )}
      </View>
    )
  }
}
