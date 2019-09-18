import Taro, { Component } from '@tarojs/taro'
import { View, Image, Navigator, Form, Input, Button } from '@tarojs/components'
import './search.scss'

import { BaseEventOrig } from '@tarojs/components/types/common'
import Rating from '../../components/rating'
import { parseSearchResults } from '../../services/search'
import { BookResult } from '../../types/search'
import searchButtonImg from '../../assets/image/baseline-search-24px.svg'

type optionalBookResult = {
  url: string;
  authors?: string;
  author_name: string;
  year: string;
}

export default class Search extends Component<{}, {
  query: string;
  results: (BookResult & Partial<optionalBookResult>)[];
  page: number;
  hasMore: boolean;
  isSearching: boolean;
  optionalResults: optionalBookResult[];
}> {

  constructor (props: {} | undefined) {
    super(props)
    this.state = {
      query: '',
      results: [],
      page: 0,
      hasMore: true,
      isSearching: false,
      optionalResults: [],
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this)
  }

  async onReachBottom () {
    if (this.state.isSearching || !this.state.hasMore) return
    Taro.showLoading()
    this.setState({
      isSearching: true,
    })
    const { data: searchRes } = await Taro.request({
      url: 'https://m.douban.com/j/search/',
      data: { q: this.state.query, t: 'book', p: this.state.page },
    })
    const results = parseSearchResults(searchRes.html)
    await new Promise(resolve => this.setState({
      results: this.state.results.concat(results),
      page: this.state.page + 1,
      isSearching: false,
    }, resolve))
    if (this.state.results.length >= searchRes.count) {
      this.setState({
        hasMore: false,
      })
    }
    Taro.hideLoading()
    await this.addYear()
  }

  async handleSearch () {
    Taro.pageScrollTo({ scrollTop: 0 })
    Taro.showLoading()
    const { data: bodyString } = await Taro.request({
      url: 'https://m.douban.com/search/',
      data: { query: this.state.query, type: 'book' },
      header: { 'Content-Type': 'text/html' },
      dataType: 'text/html',
    })
    await new Promise(resolve => this.setState({
      results: parseSearchResults(bodyString),
      hasMore: true,
      page: 1, // 搜索完第一页了
    }, resolve))
    Taro.hideLoading()
    await this.addYear(true)
  }

  /** 增加年份作者，成功率较低 */
  async addYear (isFetch = false) {
    if (isFetch) {
      const { data } = await Taro.request({
        url: 'https://book.douban.com/j/subject_suggest',
        data: { q: this.state.query },
        header: { 'Content-Type': 'text/json' },
      })
      await new Promise(resolve =>
        this.setState({ optionalResults: data, }, resolve)
      )
    }
    const results = this.state.results.map(e => {
      const e2 = this.state.optionalResults.filter(eIn => eIn.url === e.url)[0]
      if (e2) {
        e.year = e2.year
        e.authors = e2.author_name
      }
      return e
    })
    this.setState({ results })
  }

  handleSearchBarChange(event: BaseEventOrig<{
    value: string;
    cursor: number;
    keyCode: number;
  }>) {
    this.setState({ query: event.detail.value})
  }

  render () {
    return (
      <View className='container'>
        <Form onSubmit={this.handleSearch}>
          <View className='search'>
            <Input className='input-field' type='text' name='query'
              onInput={this.handleSearchBarChange} onConfirm={this.handleSearch}
            />
            <Button className='search-btn' form-type='submit'>
              <Image className='image' src={searchButtonImg} mode='aspectFit' />
            </Button>
          </View>
        </Form>
        {this.state.results.map((book, index) => (
          <Navigator key={index} className='book-card'
            url={'/pages/detail/index?url=' + book.url}>
            <View className='thumb'>
              <Image className='image' src={book.image || ''} mode='aspectFit' />
            </View>
            <View className='detail'>
              <View className='row'>
                <View className='title'>{book.title}</View>
                <Rating v-if='book.rating' value={book.rating} />
              </View>
              <View className='row'>
                <View className='authors'>{book.authors}</View>
                <View>{book.year}</View>
              </View>
            </View>
          </Navigator>
        ))}
      </View>
    )
  }
}
