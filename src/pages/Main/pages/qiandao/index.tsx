import { JXButton, JXDivider, JXSpace, JXToast, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { ActorDataConfig } from '@/types';
import { View } from '@tarojs/components';
import { useCallback, useMemo } from 'react';

function QianDao() {
  const { get, set } = useActorController();
  const qiandao = useMemo(
    () => get('qiandao') as ActorDataConfig['qiandao'],
    [get]
  );
  const handleQianDao = useCallback(() => {
    if (qiandao.time === Date.now()) {
      JXToast().show('今天已经签到过了！');
      return;
    }
    set('qiandao.time', 'xuran');
  }, [qiandao.time, set]);
  return (
    <View>
      <Text textShadow size={25}>
        签到
      </Text>
      <JXDivider />
      <JXSpace direction='vertical' style={{ width: '100%' }}>
        <Text>累计签到天数：{qiandao.count}</Text>
        <Text>上次签到日期：{qiandao.time}</Text>
        <JXSpace center style={{ width: '100%' }}>
          <JXButton width={200} onClick={handleQianDao}>
            签到
          </JXButton>
        </JXSpace>
      </JXSpace>
      <JXSpace direction='vertical'>
        <Text>签到奖励相关：</Text>
        <Text>普通奖励：灵石，仙露</Text>
        <Text>
          特殊奖励：累计签到次数，可获得，包括筑基丹，结金丹，结婴丹，元神丹，阴阳丹，渡劫丹，大小五行寿元丹等等逆天丹药
        </Text>
        <Text>（相关爆率请查看攻略 =_= ）</Text>
      </JXSpace>
    </View>
  );
}
export default QianDao;
