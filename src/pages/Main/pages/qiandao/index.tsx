import { Container, JXButton, JXSpace, JXToast, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { ActorDataConfig, CWType } from '@/types';
import { getCurrentDate } from '@/utils';
import chuwu from '@/utils/chuwu';
import { random } from 'lodash-es';
import { useCallback, useMemo } from 'react';

function QianDao() {
  const { get, set } = useActorController();
  const qiandao = useMemo(
    () => get('qiandao') as ActorDataConfig['qiandao'],
    [get]
  );
  const handleQianDao = useCallback(() => {
    const currentDate = getCurrentDate();
    if (qiandao.time === currentDate) {
      JXToast().show('今天已经签到过了！');
      return;
    }
    const ls = random(0, 9999);
    set('qiandao.time', currentDate);
    set('qiandao.last', currentDate);
    set('qiandao.count', get('qiandao.count') + 1);
    chuwu.Add({ name: '灵石', type: CWType.WP, isPile: true, num: ls });
    JXToast().show(`签到成功，获得灵石：${ls}`);
  }, [get, qiandao.time, set]);
  return (
    <Container title='签到'>
      <JXSpace direction='vertical' style={{ width: '100%' }}>
        <Text>累计签到天数：{qiandao.count} 天</Text>
        <Text>上次签到日期：{qiandao.last || ''}</Text>
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
    </Container>
  );
}
export default QianDao;
