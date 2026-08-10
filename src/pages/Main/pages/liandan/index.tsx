import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXDivider,
  JXModal,
  JXSpace,
  JXToast,
  List,
  ListItemData,
  Text,
  ItemCounter
} from '@/components';
import useActorController from '@/hooks/useActorController';
import danfangData from '@/assets/danfang.json';
import chuwu from '@/utils/chuwu';
import { CHENGHAO_RULES, getDanLuLevel, getDanLuSpeed } from '@/utils/liandan';
import { checkAchievements } from '@/utils/chengjiuHelper';
import { CWType } from '@/types';
import { currentTime, TimeArray } from '@/utils';
import { dfGrades } from '@/assets/const';
import './index.less';

export default function Liandan() {
  const { get, set, actor } = useActorController();
  const [data, setData] = useState<any>(null);
  const [num, setNum] = useState(1);
  const [chenghaoVisible, setChenghaoVisible] = useState(false);
  const [danluVisible, setDanluVisible] = useState(false);
  const customDanfang = useMemo(
    () => (actor?.danfangData ?? {}) as Record<string, any>,
    [actor]
  );

  const list = useMemo(
    () =>
      (actor?.danfang as { id: string; exp: number }[])
        .map((v) => {
          const base =
            (danfangData as Record<string, any>)[v.id] || customDanfang[v.id];
          if (!base) return null;
          return {
            key: v.id,
            title: (
              <Box>
                {base.name}（经验: {v.exp}）
              </Box>
            ),
            value: base.desc,
            click() {
              setData({ ...base, id: v.id });
            }
          } as ListItemData;
        })
        .filter(Boolean) as ListItemData[],
    [actor, customDanfang]
  );

  const complateInfo = useMemo(() => {
    const completeTime = actor?.liandan?.completeTime as number | undefined;
    if (!completeTime) return { done: false, text: '无' };

    const remainingMs = completeTime - currentTime();

    if (remainingMs <= 0) {
      return { done: true, text: '已完成' };
    }

    const last = new TimeArray(remainingMs);

    return {
      done: false,
      text: `${last.toString()}（${last.toZhouTian().toFixed(2)}周天）`
    };
  }, [actor]);

  const getNum = (item: [string, number]) => {
    return chuwu.Get({ name: item[0], type: CWType.QT })?.num || 0;
  };

  const danlu =
    (get('liandan.danlu') as { name: string; lv: number } | null) ?? null;
  const danluLv = danlu?.lv ?? 1;
  const danluLevel = getDanLuLevel(danluLv) ?? getDanLuLevel(1)!;
  const nextLevel = getDanLuLevel(danluLv + 1);

  const upgradeDanlu = useCallback(() => {
    if (!nextLevel) {
      setDanluVisible(false);
      return;
    }
    if (chuwu.getLingshi() < nextLevel.costLs) {
      JXToast().show(`灵石不足，升阶需要${nextLevel.costLs}灵石`);
      return;
    }
    const needItems = nextLevel.costItems.map((v) => ({
      name: v.name,
      num: v.num,
      type: CWType.QT
    }));
    if (!chuwu.HasArr(needItems)) {
      JXToast().show('升阶材料不足');
      return;
    }
    chuwu.payLingshi(nextLevel.costLs);
    chuwu.RemoveArr(needItems);
    set('liandan.danlu', { name: nextLevel.name, lv: nextLevel.lv });
    JXToast().show(`丹炉升阶成功：${nextLevel.name} Lv.${nextLevel.lv}`);
    setDanluVisible(false);
  }, [nextLevel, set]);

  const reset = useCallback(() => {
    set('liandan.danyao', null);
    set('liandan.time', 0);
    set('liandan.completeTime', 0);
    setData(null);
    setNum(1);
  }, [set]);

  return (
    <Container
      title='炼丹'
      desc='丹心，丹魂，丹尘。要想登上那天师之阶，只有找到自己的路，唉，不要，只看到那丹方，蒙蔽了丹心……未来，还是要看自己啊！'
    >
      <JXSpace className='attr' direction='vertical'>
        <Text>称号: {get('liandan.chenghao')}</Text>
        <Text>丹韵: {get('liandan.danyun')}</Text>
        <Text>
          丹炉: {get('liandan.danlu.name', '无')} Lv.{danluLv}
        </Text>
        <Text>丹名: {get('liandan.danyao.id', '无')}</Text>
        <Text>
          炼丹经验: {get('liandan.exp')}/{get('liandan.max_exp')}
        </Text>
        <Text>
          剩余时间:
          {complateInfo.text}
        </Text>
        <Text>
          预计收获:
          {get('liandan.danyao')?.id ? (
            <Text color='green' bold inline>
              {(
                (danfangData as Record<string, any>)[
                  get('liandan.danyao.id')
                ] || customDanfang[get('liandan.danyao.id')]
              )?.name ?? '未知丹药'}{' '}
              X{get('liandan.danyao.num') ?? 1}
            </Text>
          ) : (
            '无'
          )}
        </Text>
      </JXSpace>
      <JXSpace style={{ margin: '.5em 0.25em' }} align='center' gap={5}>
        <JXButton onClick={() => setChenghaoVisible(true)}>称号</JXButton>
        <JXButton onClick={() => setDanluVisible(true)}>升阶丹炉</JXButton>
        <JXButton
          onClick={() => {
            if (complateInfo.done) {
              const dy = get('liandan.danyao');
              const id = dy?.id;
              if (id) {
                const dNum = dy.num ?? 1;
                const base =
                  (danfangData as Record<string, any>)[id] || customDanfang[id];
                if (!base) {
                  JXToast().show('丹药数据异常');
                  reset();
                  return;
                }
                chuwu.Add({
                  name: base.name,
                  type: CWType.DY,
                  num: dNum,
                  isPile: true,
                  itype: base.itype
                });
                const gradeExp =
                  (base.itype ? dfGrades.indexOf(base.itype) + 1 : 1) * 10;
                const gainExp = Math.round(gradeExp * dNum);
                let exp = get('liandan.exp') || 0;
                const maxExp = get('liandan.max_exp') || 100;
                let newTitle = get('liandan.chenghao') || '丹徒';
                let newDanyun = get('liandan.danyun') || 0;
                exp += gainExp;
                let newMaxExp = maxExp;
                while (exp >= newMaxExp && newMaxExp > 0) {
                  exp -= newMaxExp;
                  newMaxExp = Math.round(newMaxExp * 1.2);
                  newDanyun += 1;
                  const titles = [
                    '丹徒',
                    '丹士',
                    '丹师',
                    '丹宗',
                    '丹王',
                    '丹皇',
                    '丹圣',
                    '丹帝'
                  ];
                  const titleIdx = Math.min(newDanyun, titles.length - 1);
                  newTitle = titles[titleIdx];
                }
                set('liandan.exp', exp);
                set('liandan.max_exp', newMaxExp);
                set('liandan.danyun', newDanyun);
                set('liandan.chenghao', newTitle);
                checkAchievements(get, set, actor);
                JXToast().show(
                  `获得丹药：${base.name} X ${dNum}（炼丹经验+${gainExp}）`
                );
                reset();
              } else {
                JXToast().show('未在炼制丹药');
              }
            }
          }}
        >
          起炉收丹
        </JXButton>
      </JXSpace>
      <List list={list} noFlex emptyText='暂无已掌握丹方' />
      <JXModal
        visible={!!data}
        okText='炼制'
        content={
          data ? (
            <JXSpace direction='vertical'>
              <Text size={20} bold>
                {data.name}
              </Text>
              <Text>品阶：{data.itype}</Text>
              <Text>描述：{data.desc}</Text>
              <JXSpace direction='vertical' title='需要材料'>
                {data.cl.map((item: [string, number]) => (
                  <Text key={item[0]}>
                    {item[0]} X &nbsp;
                    <Text
                      color={getNum(item) >= item[1] * num ? 'green' : 'red'}
                      inline
                    >
                      {getNum(item)}/{item[1] * num}
                    </Text>
                  </Text>
                ))}
                <Text bold>
                  炼制数量：{num}
                  <ItemCounter count={num} setCount={setNum} />
                </Text>
              </JXSpace>
            </JXSpace>
          ) : null
        }
        onOk={() => {
          const dy = get('liandan.danyao');
          const gradeIdx = data.itype ? dfGrades.indexOf(data.itype) + 1 : 1;
          if (danluLevel && gradeIdx > danluLevel.maxGradeIdx) {
            JXToast().show(
              `丹炉品阶不足，无法炼制${data.itype}丹药（当前最高可炼${danluLevel.maxGrade}）`
            );
            setData(null);
            setNum(1);
            return;
          }
          const needItems = data.cl.map((v: [string, number]) => ({
            name: v[0],
            num: v[1] * num,
            type: CWType.QT,
            isPile: true
          }));
          const hasCl = chuwu.HasArr(needItems);
          if (dy) {
            JXToast().show('正则炼制丹药，不可重复炼制！');
          } else if (hasCl) {
            chuwu.RemoveArr(needItems);
            set('liandan.danyao.id', data.id);
            set('liandan.danyao.num', num);
            const totalMs = new TimeArray(data.time).milliseconds;
            const speed = getDanLuSpeed(danluLv);
            set(
              'liandan.completeTime',
              currentTime() + Math.round(totalMs * num * speed)
            );
            set('liandan.time', currentTime());
            JXToast().show(`开始炼制丹药：${data.name} X ${num}`);
          } else {
            JXToast().show('丹药材料缺少！');
          }
          setData(null);
          setNum(1);
        }}
        onCancel={() => {
          setNum(1);
          setData(null);
        }}
      />
      <JXModal
        visible={chenghaoVisible}
        okText='知道了'
        disableCancle
        content={
          <JXSpace direction='vertical'>
            <Text size={20} bold>
              当前称号：{get('liandan.chenghao', '丹徒')}
            </Text>
            <Text>
              炼丹经验：{get('liandan.exp', 0)}/{get('liandan.max_exp', 100)}
            </Text>
            <JXDivider />
            <Text size={18} bold>
              称号晋级规则
            </Text>
            <Text color='gray'>炼丹成功后按经验自动晋级：</Text>
            {CHENGHAO_RULES.map((v) => (
              <Text key={v.name}>
                {v.name}：累计经验 {v.exp}
              </Text>
            ))}
          </JXSpace>
        }
        onOk={() => setChenghaoVisible(false)}
        onCancel={() => setChenghaoVisible(false)}
      />
      <JXModal
        visible={danluVisible}
        okText={nextLevel ? '升阶' : '关闭'}
        disableCancle={!nextLevel}
        content={
          <JXSpace direction='vertical'>
            <Text size={20} bold>
              当前丹炉：{get('liandan.danlu.name', '无')} Lv.{danluLv}
            </Text>
            <Text>品级：{danluLevel.maxGrade}</Text>
            <Text>
              炼制时间系数：{Math.round(getDanLuSpeed(danluLv) * 100)}%
            </Text>
            <JXDivider />
            {nextLevel ? (
              <>
                <Text size={18} bold>
                  升阶目标：{nextLevel.name} Lv.{nextLevel.lv}
                </Text>
                <Text>品级：{nextLevel.maxGrade}</Text>
                <Text>
                  炼制时间系数：{Math.round(getDanLuSpeed(nextLevel.lv) * 100)}%
                </Text>
                <Text>消耗灵石：{nextLevel.costLs}</Text>
                {nextLevel.costItems.map((v) => (
                  <Text key={v.name}>
                    {v.name} X {v.num}
                  </Text>
                ))}
              </>
            ) : (
              <Text>丹炉已升至最高品阶</Text>
            )}
          </JXSpace>
        }
        onOk={upgradeDanlu}
        onCancel={() => setDanluVisible(false)}
      />
    </Container>
  );
}
