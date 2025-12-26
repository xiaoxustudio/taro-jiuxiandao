import { useCallback, useMemo, useState } from 'react';
import { Button, Toast } from 'antd-mobile';
import { Text } from '@tarojs/components';
import { Container, ItemCounter, JXModal, JXSpace } from '@/components';
import useActorController from '@/hooks/useActorController';
import { numberToChinese } from '@/utils';
import chuwu from '@/utils/chuwu';
import { CWType } from '@/types';
import './index.less';

export default function Dongfu() {
  const { get, set } = useActorController();
  const pjMemo = useMemo(() => `${numberToChinese(get('dongfu').lv)}阶`, [get]);
  const [blNum, setBlNum] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const lingshi = useMemo(
    () => chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0,
    [get, set] // eslint-disable-line
    // 使其强制刷新
  );

  const handleBuling = () => {
    setIsModalVisible(true);
  };

  const handleOk = useCallback(() => {
    if (!blNum) {
      Toast.show('请加注数量');
      return;
    }
    if (lingshi >= blNum) {
      chuwu.Remove({ name: '灵石', type: CWType.QT, num: blNum });
      set('dongfu.lingchi', Math.floor(blNum / 10) + get('dongfu.lingchi'));
    } else {
      Toast.show('灵石不足');
      return;
    }
    setIsModalVisible(false);
  }, [blNum, get, lingshi, set]);

  return (
    <Container
      title='洞府'
      desc='修仙之人，天地为家！群山万壑之中，云海翻涌，了无人烟！天光倾泻，鸥鹤成云！洞府之外，小兽嬉戏打闹，一抹倩影在洞府外等待你的归来……'
    >
      <JXSpace direction='vertical' gap={5} style={{ padding: '0 10px' }}>
        <Text>
          洞府品阶：{pjMemo}({get('dongfu').lv})
        </Text>
        <Text>灵池灵气：{get('dongfu').lingchi}</Text>
      </JXSpace>
      <JXSpace style={{ margin: '10px 0', padding: '0 10px' }}>
        <Text>{get('daohao')} 还未拥有道侣</Text>
      </JXSpace>
      <JXSpace direction='vertical' gap={5}>
        <Button style={{ width: '100%' }} onClick={handleBuling}>
          补灵
        </Button>
        <Button style={{ width: '100%' }} disabled>
          升阶
        </Button>
        <Button style={{ width: '100%' }} disabled>
          双修
        </Button>
        <Button style={{ width: '100%' }} disabled>
          仙缘
        </Button>
        <Button style={{ width: '100%' }} disabled>
          道侣
        </Button>
      </JXSpace>
      {/* 贡献 */}
      <JXModal
        visible={isModalVisible}
        title='补灵'
        afterClose={() => {
          setBlNum(0);
        }}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <JXSpace direction='vertical'>
          <Text>灵石：{lingshi}</Text>
          <Text>
            想要贡献数量：{blNum} == {Math.floor(blNum / 10)}灵气
          </Text>
          <hr />
          <ItemCounter count={blNum} setCount={setBlNum} />
          <Text>10灵石=1灵气</Text>
        </JXSpace>
      </JXModal>
    </Container>
  );
}
