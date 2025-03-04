import { View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import './index.less';

export default function Chuwu() {
  useLoad(() => {
    console.log('Page loaded.');
  });

  return (
    <View className='chuwu'>

    </View>
  );
}
