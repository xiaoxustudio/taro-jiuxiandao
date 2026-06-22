import { random } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { Container, JXButton, JXSpace, JXToast, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { ActorDataConfig, CWType } from '@/types';
import { getCurrentDate } from '@/utils';
import chuwu from '@/utils/chuwu';
import { checkQiandaoAchievements } from '@/utils/chengjiuHelper';

function QianDao() {
  const { get, set } = useActorController();
  const qiandao = useMemo(
    () => get('qiandao') as ActorDataConfig['qiandao'],
    [get]
  );
  const isSigned = useMemo(
    () => qiandao.time === getCurrentDate(),
    [qiandao.time]
  );
  const handleQianDao = useCallback(() => {
    const currentDate = getCurrentDate();
    if (isSigned) {
      JXToast().show('今天已经签到过了！');
      return;
    }

    // 在更新lastDate之前获取上一次签到日期
    const lastDate = get('qiandao.last');
    let streak = get('qiandao.streak') || 0;

    // 计算连续签到天数
    if (lastDate) {
      // 计算日期差
      const lastDateObj = new Date(lastDate);
      const currentDateObj = new Date(currentDate);
      const diffTime = currentDateObj.getTime() - lastDateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 连续签到，增加连续天数
        streak += 1;
      } else if (diffDays > 1) {
        // 中断签到，重置连续天数
        streak = 1;
      }
    } else {
      // 第一次签到
      streak = 1;
    }

    const ls = random(10, 50) + streak * 20;
    set('qiandao.time', currentDate);
    set('qiandao.last', currentDate);
    set('qiandao.count', get('qiandao.count') + 1);
    set('qiandao.streak', streak);

    // 检查签到成就
    checkQiandaoAchievements(get, set);

    chuwu.Add({ name: '灵石', type: CWType.QT, isPile: true, num: ls });
    JXToast().show(`签到成功，获得灵石：${ls}`);
  }, [get, isSigned, set]);

  return (
    <Container title='签到'>
      <JXSpace direction='vertical' style={{ width: '100%' }}>
        <Text>累计签到天数：{qiandao.count} 天</Text>
        <Text>连续签到天数：{qiandao.streak || 0} 天</Text>
        <Text>上次签到日期：{qiandao.last || ''}</Text>
        <JXSpace center style={{ width: '100%' }}>
          <JXButton disabled={isSigned} width={200} onClick={handleQianDao}>
            {!isSigned ? '签到' : '已签到'}
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
