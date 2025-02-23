import title from '@/assets/logo.png';
import { JXButton, JXSpace, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { View } from '@tarojs/components';
import { Image } from 'antd-mobile';
import styles from './index.module.less';

function Main() {
  const actor = useActorController();
  return (
    <View>
      <JXSpace className={styles.MainBox} direction='vertical'>
        <JXSpace className={styles.Title}>
          <Image width={60} src={title} />
        </JXSpace>
        {/* 属性 */}
        <JXSpace className={styles.Attr} direction='vertical'>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              道号：
            </Text>
            {actor.get('daohao')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              修为：
            </Text>
            {actor.get('xiuwei')}/{actor.get('max_xiuwei')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              神识：
            </Text>
            {actor.get('shenshi')}/{actor.get('max_shenshi')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              寿元：
            </Text>
            {actor.get('shouyuan')}/{actor.get('max_shouyuan')}
          </Text>
          <Text space={2}>
            <Text className={styles.AttrTitle} bold inline>
              境界：
            </Text>
            {actor.get('jingjie')}
            {actor.get('max_jingjie')}
          </Text>
        </JXSpace>
        {/* 修炼 */}
        <JXSpace className={styles.XiuLianBox} center>
          <JXButton size='mini' transparent>
            <Text textShadow>修炼：</Text>
          </JXButton>
          <Text> 未开始修炼</Text>
        </JXSpace>
      </JXSpace>
    </View>
  );
}

export default Main;
