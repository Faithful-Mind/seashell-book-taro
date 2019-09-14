import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

import { TopSwiperBook, ListBook } from '../../types/book'
import { getTops, getBookList } from './services'

import TopSwiper from '../../components/top-swiper'
import Card from '../../components/card'

export default class Index extends Component<{}, {
  tops: TopSwiperBook[];
  books: ListBook[];
  page: number;
  hasMore: boolean;
}> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true,
  }

  constructor (props: {} | undefined) {
    super(props)
    this.state = {
      tops: [],
      books: [],
      page: 0,
      hasMore: true,
    }
    Taro.showNavigationBarLoading()
    Promise.all([
      getTops().then(tops => this.setState({ tops })),
      this.getList()
    ]).then(() =>
      Taro.hideNavigationBarLoading()
    )
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  async onPullDownRefresh () {
    Taro.showNavigationBarLoading()
    await this.doRefresh()
    Taro.hideNavigationBarLoading()
    Taro.stopPullDownRefresh()
  }

  async onReachBottom () {
    if (!this.state.hasMore) return
    Taro.showNavigationBarLoading()
    await this.getList()
    Taro.hideNavigationBarLoading()
  }

  doRefresh () {
    return new Promise((resolve, reject) => {
      this.setState(
        { // 分页初始化归零
          tops: [],
          books: [],
          page: 0,
          hasMore: true,
        },
        () =>
          Promise.all([
            getTops().then(tops => this.setState({ tops })),
            this.getList()
          ])
            .then(resolve)
            .catch(reject)
      )
    })
  }

  async getList () {
    if (!this.state.hasMore) return
    const pageSize = 10
    const books = await getBookList(this.state.page, pageSize)
    return new Promise(resolve =>
      this.setState(
        {
          books: this.state.books.concat(books),
          page: this.state.page + 1,
          hasMore: books.length >= pageSize, // 数量小于分页长度则视作尽头
        },
        resolve
      )
    )
  }

  render () {
    return (
      <View className='index'>
        <TopSwiper tops={this.state.tops} />
        <View className='card-container'>
          {this.state.books.map((book, index) =>
            <Card book={book} key={index}></Card>
          )}
          {!this.state.hasMore && (
            <View className='text-footer'>没有更多了</View>
          )}
        </View>
      </View>
    )
  }
}
