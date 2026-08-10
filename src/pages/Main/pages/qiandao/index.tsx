import { random } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { Container, JXButton, JXSpace, JXToast, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { CWType } from '@/types';
import { getCurrentDate } from '@/utils';
import { REALM_ORDER } from '@/assets/const';
import chuwu from '@/utils/chuwu';
import { checkQiandaoAchievements } from '@/utils/chengjiuHelper';

const MILESTONES: { count: number; pill: string }[] = [
  { count: 7, pill: '筑基丹' },
  { count: 30, pill: '结金丹' },
  { count: 60, pill: '元婴丹' },
  { count: 100, pill: '化神丹' },
  { count: 150, pill: '返虚丹' },
  { count: 200, pill: '合体丹' },
  { count: 300, pill: '大乘丹' }
];

function QianDao() {
  const { get, set, actor } = useActorController();
  const qiandao = useMemo(
    () => actor?.qiandao ?? { count: 0, last: '', time: '', streak: 0 },
    [actor]
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

    // 计算连续签到天数（使用 Date.UTC 避免时区和跨年边界问题）
    if (lastDate) {
      const parseDateUtc = (dateStr: string): number | null => {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        return Date.UTC(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
      };
      const lastDateMs = parseDateUtc(lastDate);
      const currentDateMs = parseDateUtc(currentDate);
      if (lastDateMs !== null && currentDateMs !== null) {
        const diffDays = Math.round(
          (currentDateMs - lastDateMs) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          // 连续签到，增加连续天数
          streak += 1;
        } else if (diffDays > 1) {
          // 中断签到，重置连续天数
          streak = 1;
        }
      }
    } else {
      // 第一次签到
      streak = 1;
    }

    const realm = get('jingjie') as string;
    const realmIdx = Math.max(0, REALM_ORDER.indexOf(realm));
    const realmScale = Math.max(1, realmIdx + 1);
    const ls = random(10, 50) * realmScale + streak * 20;
    const totalCount = get('qiandao.count') + 1;
    set('qiandao.time', currentDate);
    set('qiandao.last', currentDate);
    set('qiandao.count', totalCount);
    set('qiandao.streak', streak);

    // 检查签到成就
    checkQiandaoAchievements(get, set);

    chuwu.Add({ name: '灵石', type: CWType.QT, isPile: true, num: ls });
    let toastMsg = `签到成功，获得灵石：${ls}`;

    // 累计签到特殊奖励（同时奖励境界缩放灵石）
    const milestoneLs = totalCount * 5 * realmScale;
    const milestone = MILESTONES.find((m) => m.count === totalCount);
    if (milestone) {
      chuwu.Add({
        name: milestone.pill,
        type: CWType.DY,
        num: 1,
        isPile: true
      });
      chuwu.Add({
        name: '灵石',
        type: CWType.QT,
        isPile: true,
        num: milestoneLs
      });
      toastMsg += `，获得${milestone.pill}！灵石+${milestoneLs}`;
    } else if (totalCount % 10 === 0 && streak >= totalCount) {
      chuwu.Add({ name: '寿元丹', type: CWType.DY, num: 1, isPile: true });
      chuwu.Add({
        name: '灵石',
        type: CWType.QT,
        isPile: true,
        num: milestoneLs
      });
      toastMsg += `，获得寿元丹！灵石+${milestoneLs}`;
    }

    JXToast().show(toastMsg);
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
        <Text>签到奖励规则：</Text>
        <Text>每日签到：灵石（基础10-50 + 连击×20）</Text>
        <Text>累计7天：筑基丹 | 30天：结金丹 | 60天：元婴丹</Text>
        <Text>累计100天：化神丹 | 150天：返虚丹</Text>
        <Text>累计200天：合体丹 | 300天：大乘丹</Text>
        <Text>连续签到满10的倍数额外获得寿元丹</Text>
      </JXSpace>
    </Container>
  );
}
export default QianDao;
