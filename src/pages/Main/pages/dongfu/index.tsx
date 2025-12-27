import { round } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { Button, Toast } from 'antd-mobile';
import { Text, View } from '@tarojs/components';
import { Container, ItemCounter, JXModal, JXSpace } from '@/components';
import useActorController from '@/hooks/useActorController';
import { numberToChinese } from '@/utils';
import chuwu from '@/utils/chuwu';
import { CWType } from '@/types';
import useModal from '@/hooks/useModal';
import './index.less';

export default function Dongfu() {
  const { get, set } = useActorController();

  const [blNum, setBlNum] = useState(0); // 补灵数量
  const { state: stateBuling } = useModal(); // 补灵
  const { state: stateShengjie } = useModal(); // 升阶
  const lv = useMemo(() => get('dongfu').lv, [get]);
  const pjMemo = useMemo(() => `${numberToChinese(lv)}阶`, [lv]);

  const lingshi = useMemo(
    () => chuwu.Get({ name: '灵石', type: CWType.QT })?.num || 0,
    [get, set] // eslint-disable-line
    // 使其强制刷新
  );

  const needUpLingshi = useMemo(() => lv * 2000, [lv]);

  /* 补灵 */
  const getTransformRate = useMemo(() => lv * 0.005, [lv]); // 每升1级，补灵的转化率增加0.5%
  const getTransformRateMemo = useMemo(
    () => `${getTransformRate * 100}%`,
    [getTransformRate]
  ); // 转化率百分比
  const needLingshiNum = useMemo(
    () => round(Math.floor(blNum * getTransformRate)),
    [blNum, getTransformRate]
  );

  const handleOk = useCallback(() => {
    if (!blNum) {
      Toast.show('请加注数量');
      return;
    }
    if (lingshi >= blNum) {
      chuwu.Remove({ name: '灵石', type: CWType.QT, num: blNum });
      set(
        'dongfu.lingchi',
        Math.floor(blNum / 10) + needLingshiNum + get('dongfu.lingchi')
      );
    } else {
      Toast.show('灵石不足');
      return;
    }
    stateBuling.setVisiableModal(false);
  }, [blNum, get, lingshi, needLingshiNum, set, stateBuling]);

  const handleShengjie = useCallback(() => {
    // 每10阶段需要一个升灵石
    if (lv % 10 === 0) {
      if (chuwu.Get({ name: '升灵石', type: CWType.QT })?.num) {
        chuwu.Remove({ name: '升灵石', type: CWType.QT, num: 1 });
        set('dongfu.lv', lv + 1);
      } else {
        Toast.show('升灵石不足');
        return;
      }
    } else if (lingshi >= needUpLingshi) {
      chuwu.Remove({ name: '灵石', type: CWType.QT, num: needUpLingshi });
      set('dongfu.lv', lv + 1);
    } else {
      Toast.show('灵石不足');
      return;
    }
  }, [lingshi, lv, needUpLingshi, set]);

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
        <Button
          style={{ width: '100%' }}
          onClick={() => stateBuling.setVisiableModal(true)}
        >
          补灵
        </Button>
        <Button
          style={{ width: '100%' }}
          onClick={() => stateShengjie.setVisiableModal(true)}
        >
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
        controller={stateBuling}
        title='补灵'
        afterClose={() => {
          setBlNum(0);
        }}
        onOk={handleOk}
        onCancel={() => stateBuling.setVisiableModal(false)}
      >
        <JXSpace direction='vertical'>
          <Text>灵石：{lingshi}</Text>
          <Text>
            想要贡献数量：
            <View>
              {blNum} ==&gt; {Math.floor(blNum / 10)}灵气
            </View>
          </Text>
          <hr />
          <ItemCounter count={blNum} setCount={setBlNum} />
          <Text>
            注入后可额外获得：
            <View>
              {getTransformRateMemo}灵气（{needLingshiNum}）
            </View>
          </Text>
          <hr />
          <Text>10灵石=1灵气</Text>
          <Text>升级洞府可提升更多额外灵气率</Text>
        </JXSpace>
      </JXModal>
      {/* 升阶 */}
      <JXModal
        controller={stateShengjie}
        title='升阶'
        afterClose={() => {}}
        onOk={handleShengjie}
        okText='确认升阶'
        onCancel={() => stateShengjie.setVisiableModal(false)}
      >
        <View>
          当前：{pjMemo}({get('dongfu').lv})
        </View>
        <View>
          升阶后：{pjMemo}({get('dongfu').lv + 1})
        </View>
        <View>
          需要灵石：{needUpLingshi}(
          <Text style={{ color: lingshi >= needUpLingshi ? 'green' : 'red' }}>
            {lingshi}
          </Text>
          )
        </View>
      </JXModal>
    </Container>
  );
}
