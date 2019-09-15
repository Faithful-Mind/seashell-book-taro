import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './comments-section.scss'

import { ShortComment } from '../../types/comment';
import Rating from '../rating'
import thumbUp from '../../assets/image/thumb-up.png';

export default class CommentsSection extends Component<{
  comments: ShortComment[];
}> {

  static defaultProps = {
    comments: [],
  }

  render () {
    return (
      <View className='comment-list'>
        <View className='page-title'>
          短评
        </View>
        {this.props.comments.map((comment, index) => (
          <View className='comment' key={index}>
            <View className='user-line'>
              <View className='left'>
                <Image
                  src={comment.user.avatar}
                  className='avatar'
                  mode='aspectFit'
                />
                <Text>
                  {comment.user.name}
                </Text>
              </View>
              <View className='right'>
                <View className='likes'>
                  {comment.likes}
                  <Image className='like-btn' src={thumbUp} />
                </View>
                <Rating value={(comment.rating || 0) * 2} />
              </View>
            </View>
            <View className='content'>{comment.comment}</View>
          </View>
        ))}
      </View>
    )
  }
}
