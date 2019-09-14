import Taro, { Component } from '@tarojs/taro'
import { View, Image, Navigator } from '@tarojs/components'
import { ListBook } from '../../types/book'

import './card.scss'

import Rating from '../rating'

export default class Card extends Component<{
  book: ListBook & { userInfo?: { nickName: string } };
}> {

  static defaultProps = {
    book: {}
  }

  render () {
    const book = this.props.book
    return (
      <Navigator url={'/pages/detail/index?isbn=' + book.isbn}>
        <View className='book-card'>
          <View className='thumb'>
            <Image className='image' src={book.image} mode='aspectFit' />
          </View>
          <View className='detail'>
            <View className='row'>
              <View className='left title text-primary'>
                {book.title}
              </View>
              <View className='right'>
                {book.rating}
                {book.rating != null &&
                  <Rating value={book.rating} />
                }
              </View>
            </View>
            <View className='row'>
              <View className='left authors'>
                {book.authors}
              </View>
              <View className='right'>
                浏览量: {book.count}
              </View>
            </View>
            <View className='row'>
              <View className='left'>
                {book.publisher}
              </View>
              <View className='right'>
                {book.userInfo && book.userInfo.nickName || ''}
              </View>
            </View>
          </View>
        </View>
      </Navigator>
    )
  }
}
