import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './book-info.scss'

import Rating from '../rating'
import { BookInfoBook } from '../../types/book'

export default class BookInfo extends Component<{ info: BookInfoBook }> {

  static defaultProps = {
    info: {},
  }

  constructor (props: { info: BookInfoBook; } | undefined) {
    super(props)
    this.tagsArr = this.tagsArr.bind(this)
    this.summaryParas = this.summaryParas.bind(this)
    this.preview = this.preview.bind(this)
  }

  tagsArr () {
    return (this.props.info.tags && this.props.info.tags.split(',')) || []
  }

  summaryParas () {
    return (
      (this.props.info.summary &&
        this.props.info.summary.split(/\s*\n\s*/m)) ||
      []
    )
  }

  preview () {
    Taro.previewImage({
      current: this.props.info.image,
      urls: [this.props.info.image]
    })
  }

  render () {
    const info = this.props.info
    return (
      <View className='book-info'>
        <View className='thumb'>
          <Image className='back' src={info.image} mode='aspectFill' />
          <Image className='img' src={info.image} onClick={this.preview} mode='aspectFit' />
          <View className='info'>
            <View className='title'>
              {info.title}
            </View>
            <View className='authors'>
              {info.authors || info.abstract}
            </View>
          </View>
        </View>
        <View className='row'>
          {typeof info.rating === 'number' && !isNaN(info.rating) &&
            <View className='right'>
              {info.rating}分
              <Rating value={info.rating} />
            </View>
          }
        </View>
        <View className='row'>
          {info.publisher}
          <View className='right'>
            {info.price}
          </View>
        </View>
        <View className='tags'>
          {this.tagsArr().map((tag, index) => (
            <View className='badge' key={index}>{tag}</View>
          ))}
        </View>
        <View className='summary'>
          {this.summaryParas().map((para, index) => (
            <View key={index}>{para}</View>
          ))}
        </View>
      </View>
    )
  }
}
