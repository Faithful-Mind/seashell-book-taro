import Taro, { Component } from '@tarojs/taro'
// 引入 Swiper, SwiperItem 组件
import { Swiper, SwiperItem, Image } from '@tarojs/components'
import { TopSwiperBook } from '../../types/book'

import './top-swiper.scss'

import { chunk } from '../../utils'

export default class TopSwiper extends Component<{
  tops: TopSwiperBook[]
}> {
  static defaultProps = {
    tops: [],
  }

  render () {
    return (
      <Swiper
        className='test-h'
        indicatorColor='#999'
        indicatorActiveColor='#333'
        circular
        indicatorDots
        autoplay>
        {chunk(this.props.tops).map((bookArr, index) => (
          <SwiperItem key={index}>
            {bookArr.map((book, index2) => (
              <Image
                className='slide-image'
                mode='aspectFit'
                src={book.image}
                key={index2}
              />
            ))}
          </SwiperItem>
        ))}
      </Swiper>
    )
  }
}
