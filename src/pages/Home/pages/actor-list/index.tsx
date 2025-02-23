import { JXModal, JXSpace } from '@/components';
import useActorController from '@/hooks/useActorController';
import useActorStore from '@/store/actor';
import { View } from '@tarojs/components';
import { List } from 'antd-mobile';
import { omit } from 'lodash-es';
import { useMemo } from 'react';
import './index.less';

export default function ActorList() {
  const actor = useActorStore();
  const actorController = useActorController();
  const list = useMemo(() => omit(actor, 'set'), [actor]);
  return (
    <View className='actor-list'>
      <List header='角色列表'>
        {Object.keys(list).map((v) => (
          <List.Item
            key={v}
            onClick={() => {
              JXModal.show({
                content: <>选择角色：{v}，是否进入游戏？</>,
                okText: '进入',
              });
            }}
          >
            {v}({+actorController.get('lv')})
          </List.Item>
        ))}
      </List>
      <JXSpace direction='vertical'></JXSpace>
    </View>
  );
}
