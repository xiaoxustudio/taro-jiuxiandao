import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.less'

export default function Liandan () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='liandan'>
      <Text>Hello world!</Text>
    </View>
  )
}
