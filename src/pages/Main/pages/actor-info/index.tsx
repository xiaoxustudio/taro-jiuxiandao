import { JXSpace, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { View } from '@tarojs/components';
import './index.less';

export default function ActorInfo() {
  const { get } = useActorController();
  return (
    <View className='actor-info'>
      <View className='head'>
        <Text textShadow size={20} bold>
          {get('daohao')}
        </Text>
      </View>
      <JXSpace
        style={{ background: 'white', marginBottom: '10px' }}
        direction='vertical'
        flexOne
      >
        <Text className='item' size={16} bold>
          等级：{get('lv')}
        </Text>
        <Text className='item' size={16} bold>
          境界：{get('jingjie')}
          {get('max_jingjie')}
        </Text>
        <Text className='item' size={16} bold>
          神识：{get('shenshi')}/{get('max_shenshi')}
        </Text>
        <Text className='item' size={16} bold>
          气血：{get('qixue')}
        </Text>
        <Text className='item' size={16} bold>
          总攻击：{get('gongji')}
        </Text>
        <Text className='item' size={16} bold>
          总防御：{get('fangyu')}
        </Text>
        <Text className='item' size={16} bold>
          攻速：{get('sudu')}
        </Text>
        <Text className='item' size={16} bold>
          仙缘：{get('xuanyuan')}
        </Text>
        <Text className='item' size={16} bold>
          暴击：{get('baoji')}
        </Text>
        <Text className='item' size={16} bold>
          灵根：{get('linggen')}灵根
        </Text>
        <Text className='item' size={16} bold>
          寿元：{get('shouyuan')}/{get('max_shouyuan')}
        </Text>
      </JXSpace>
      <JXSpace style={{ background: 'white' }} direction='vertical'>
        <Text className='item' size={16} bold>
          修仙约吗？道友！
        </Text>
        <Text className='item' size={16} bold>
          Go，我在九仙道等你！
        </Text>
      </JXSpace>
    </View>
  );
}
