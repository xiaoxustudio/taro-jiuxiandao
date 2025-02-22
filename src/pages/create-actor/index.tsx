import { JXButton, JXInput, JXSpace, Text } from '@/components';
import { View } from '@tarojs/components';
import { Selector } from 'antd-mobile';
import { useState } from 'react';
import styles from './index.module.less';

const options = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        金灵根
      </Text>
    ),
    value: '金',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        木灵根
      </Text>
    ),
    value: '木',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        水灵根
      </Text>
    ),
    value: '水',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        火灵根
      </Text>
    ),
    value: '火',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        土灵根
      </Text>
    ),
    value: '土',
  },
];

const races = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        人族
      </Text>
    ),
    value: '人',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        魔族
      </Text>
    ),
    value: '魔',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        妖族
      </Text>
    ),
    value: '妖',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        鬼族
      </Text>
    ),
    value: '鬼',
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        灵族
      </Text>
    ),
    value: '灵',
  },
];

function Index() {
  const [actor, setActor] = useState({
    daohao: '',
    linggen: '金',
    zhongzu: '人',
  });

  return (
    <View className={styles.Container}>
      <JXSpace className={styles.Container} direction='vertical'>
        <View className={styles.Title}>
          创建角色
          <Text size={14} color='#ccc' inline>
            ({actor.daohao.length}/10)
          </Text>
        </View>
        <View>
          <JXInput
            className={styles.Input}
            placeholder='请输入你的角色名称'
            value={actor.daohao}
            maxLength={10}
            onChange={(v) => setActor({ ...actor, daohao: v })}
          />
        </View>
        {/* 灵根 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你的角色
          </Text>
          <JXSpace>
            <Selector
              options={options}
              defaultValue={[actor.linggen]}
              onChange={(arr) => setActor({ ...actor, linggen: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        {/* 种猪 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你出身种族
          </Text>
          <JXSpace>
            <Selector
              options={races}
              defaultValue={[actor.zhongzu]}
              onChange={(arr) => setActor({ ...actor, zhongzu: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        <JXSpace className={styles.Bottom} gap={20}>
          <JXButton width={200}>创建角色</JXButton>
        </JXSpace>
      </JXSpace>
    </View>
  );
}
export default Index;
