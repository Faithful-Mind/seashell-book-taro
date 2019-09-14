import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import './rating.scss'

export default class Rating extends Component<{
  value: number;
  color: string;
  bottomColor: string;
}> {

  static defaultProps = {
    value: 0,
    color: '#ffb712',
    bottomColor: '#e5e5e5',
  }

  render () {
    const { value, color, bottomColor } = this.props
    return (
      <View className='rating'>
        <Text style={`width: ${value * 10}%; color: ${color};`}>☆☆☆☆☆</Text>
        <Text className='hollow' style={`color: ${bottomColor};`}>★★★★★</Text>
      </View>
    )
  }
}
