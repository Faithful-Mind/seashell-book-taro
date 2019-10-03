import Taro, { Component } from '@tarojs/taro'
import { View, Progress } from '@tarojs/components'

import './year-progress.scss'

function isLeapYear () {
  const year = new Date().getFullYear()
  return !(year % 400) || (!(year % 4) && (year % 100))
}

export default class YearProgress extends Component {

  year () {
    return new Date().getFullYear()
  }

  days () {
    var yearStart = new Date()
    yearStart.setMonth(0, 1)
    var offset = Date.now() - yearStart.getTime()
    var days = (offset / 1000 / 60 / 60 / 24) + 1 // 从第一天算
    return ~~days // 两次按位非取整
  }

  percent () {
    var yearDays = isLeapYear() ? 366 : 365
    return Number((this.days() / yearDays * 100).toFixed(1))
  }

  render () {
    return (
      <View className='progressbar'>
        <Progress percent={this.percent()} activeColor='#039be5' />
        <View>{this.year()}已经过了{this.days()}天，{this.percent()}%</View>
      </View>
    )
  }
}
