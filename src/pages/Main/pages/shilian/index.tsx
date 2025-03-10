import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.less'

export default function Shilian () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='shilian'>
      <Text>Hello world!</Text>
    </View>
  )
}
