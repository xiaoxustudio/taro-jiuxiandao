import { View } from '@tarojs/components';
import { List } from 'antd-mobile';
import { JXModal, JXSpace } from '@/components';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { navigateTo } from '@/utils';
import './index.less';

export default function ActorList() {
  const { set: setStore } = useStore();
  const { remove, actors } = useActorStore();

  return (
    <View className='actor-list'>
      <List header='角色列表'>
        {Object.keys(actors).map((v) => (
          <List.Item
            key={v}
            onClick={() => {
              const c = JXModal.show({
                content: <>选择角色：{v}，是否进入游戏？</>,
                okText: '进入',
                onOk() {
                  setStore(v);
                  navigateTo('Main/index', { replace: true });
                  c.close();
                },
                cancleText: '删除',
                async onCancel() {
                  setStore('');
                  remove(v);
                  c.close();
                }
              });
            }}
          >
            {v}
          </List.Item>
        ))}
      </List>
      <JXSpace direction='vertical' />
    </View>
  );
}
