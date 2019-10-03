import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import './me.scss'

import { UserInfo } from '../../types/user-info'
import { ListBook } from '../../types/book'
import { addBookByIsbn, getBooksByOpenId } from '../../services/me'
import Card from '../../components/card'
import YearProgress from '../../components/year-progress'

export default class Me extends Component<{}, {
  userInfo: UserInfo;
  books: ListBook[];
  page: number;
  hasMore: boolean;
}> {

  constructor (props: {} | undefined) {
    super(props)
    this.state = {
      userInfo: Taro.getStorageSync('userInfo') || {},
      books: [],
      page: 0,
      hasMore: true,
    }
    this.doRefresh()
  }

  async onReachBottom () {
    if (!this.state.hasMore) return
    Taro.showNavigationBarLoading()
    await this.getBooks()
    Taro.hideNavigationBarLoading()
  }

  async handleLogin (e: { detail: { userInfo: UserInfo; }; }) {
    // 登录按钮事件对象目标含有用户信息（缺openID）
    var user = Taro.getStorageSync('userInfo') || e.detail.userInfo
    if (!user.openId) {
      try {
        Taro.showLoading({ title: '登录中' })
        const res = await Taro.cloud.callFunction({
          name: 'login',
        })
        user.openId = res.result.openid
        Taro.setStorageSync('userInfo', user)
        this.setState({
          userInfo: user,
        })
        Taro.showToast({ title: '登录成功' })
        await this.doRefresh()
      } catch (err) {
        console.error('登录失败', err)
        Taro.showModal({ title: '登录失败', content: err, showCancel: false })
      }
    }
  }

  async handleScanBook () {
    const { result } = await Taro.scanCode({
      scanType: 'barCode',
    })
    // 添加时提供反馈
    Taro.showLoading({ title: '添加中' })
    try {
      const { title } = await addBookByIsbn(result)
      Taro.showToast({ title: `添加成功 ${title}` })
      setTimeout(() => Taro.showToast({ title }), 1000)
    } catch (err) {
      Taro.hideLoading()
      if (err.message === '图书已存在') {
        return Taro.showModal({
          title: '添加失败',
          content: `${result} 图书已存在`,
          showCancel: false,
        })
      }
      console.error('添加图书失败', result, err)
      Taro.showModal({
        title: `添加失败 ${result}`, content: err, showCancel: false
      })
    }
  }

  async doRefresh () {
    // 分页初始化归零
    await new Promise(resolve => this.setState({
      userInfo: Taro.getStorageSync('userInfo') || this.state.userInfo,
      books: [],
      page: 0,
      hasMore: true,
    }, resolve))

    if (this.state.userInfo.openId) {
      Taro.showNavigationBarLoading()
      await this.getBooks()
      Taro.hideNavigationBarLoading()
    }
  }

  async getBooks () {
    if (!this.state.hasMore) return
    const pageSize = 10
    const books = await getBooksByOpenId(
      this.state.userInfo.openId,
      this.state.page,
      pageSize
    )
    this.setState({
      books: this.state.books.concat(books),
      page: this.state.page + 1,
      hasMore: books.length >= pageSize, // 数量小于分页长度则视作尽头
    })
  }

  render () {
    return (
      <View className='container'>
        <View className='user-container'>
          <View className='user-info'>
            <Image
              className='avatar'
              src={this.state.userInfo.avatarUrl || '/static/img/unlogin.png'}
            />
            {this.state.userInfo.openId ? (
              <View>{this.state.userInfo.nickName}</View>
            ) : (
              <Button
                open-type='getUserInfo'
                lang='zh_CN'
                onGetUserInfo={this.handleLogin}>
                点击登录
              </Button>
            )}
          </View>

          <YearProgress />
          {this.state.userInfo.openId && (
            <Button className='btn' onClick={this.handleScanBook}>
              添加新图书
            </Button>
          )}
        </View>

        {!this.state.books.length ? (
          <View style={{ textAlign: 'center' }}>
            快去扫码添加图书吧！😉
          </View>
        ) : (
          <View v-else>我添加的书籍：</View>
        )}
        <View className='card-container'>
          {this.state.books.map((book, index) =>
            <Card key={index} book={book} />
          )}
          {!this.state.hasMore && (
            <View className='text-footer'>没有更多了</View>
          )}
        </View>
      </View>
    )
  }
}
