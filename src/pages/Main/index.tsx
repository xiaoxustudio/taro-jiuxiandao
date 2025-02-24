import title from '@/assets/logo.png';
import { JXButton, JXSpace, Paragraph, Text } from '@/components';
import JXGrid from '@/components/Grid';
import useActorController from '@/hooks/useActorController';
import { View } from '@tarojs/components';
import { Grid, Image } from 'antd-mobile';
import { operaterOptions, operaterOptions2 } from './consts';
import styles from './index.module.less';

function Main() {
  const actor = useActorController();

  return (
    <View>
      <JXSpace className={styles.MainBox} direction='vertical'>
        <JXSpace className={styles.Title}>
          <Image width={120} src={title} />
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
        {/* 操作 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions.map((v) => (
            <JXGrid.Item key={v.name} align='center'>
              <JXButton size='mini' transparent onClick={v.click}>
                <Text textShadow>{v.name}</Text>
              </JXButton>
            </JXGrid.Item>
          ))}
        </JXGrid>
        {/* 动态 */}
        <JXSpace className={styles.ContentBox} direction='vertical'>
          <Text color='orange' bold>
            动态
          </Text>
          <Paragraph>测试</Paragraph>
        </JXSpace>
        {/* 操作2 */}
        <JXGrid className={styles.ContentBox} columns={4} gap={12}>
          {operaterOptions2.map((v) => (
            <JXGrid.Item key={v.name} align='center'>
              <JXButton size='mini' transparent onClick={v.click}>
                <Text textShadow>{v.name}</Text>
              </JXButton>
            </JXGrid.Item>
          ))}
        </JXGrid>
        {/* 修炼 */}
        <JXGrid className={styles.BottomBox} columns={4}>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>角色</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>社区</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>CDK</Text>
            </JXButton>
          </JXGrid.Item>
          <JXGrid.Item align='center'>
            <JXButton size='mini' transparent>
              <Text textShadow>签到</Text>
            </JXButton>
          </JXGrid.Item>
        </JXGrid>
      </JXSpace>
    </View>
  );
}

export default Main;
