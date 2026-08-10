import { useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  List,
  ListItemData,
  Scroll,
  Text
} from '@/components';
import {
  ActorDataConfigForZhanDou,
  CWType,
  FabaoType,
  FBItemType
} from '@/types';
import { AttrTransformChinese, getGradeColor } from '@/utils';
import chuwu from '@/utils/chuwu';
import useActorController from '@/hooks/useActorController';
import useContainer from '@/hooks/useContainer';
import { clGrades, faBaoTierConfig, faBaoTypeConfig } from '@/assets/const';
import PageHeader from '@/components/PageHeader';
import './index.less';

type CraftRule = {
  pj: string;
  clGrade: (typeof clGrades)[number];
  clNum: number;
  ls: number;
};

const CRAFT_RULES: CraftRule[] = [
  { pj: '法器', clGrade: '一品', clNum: 5, ls: 300 },
  { pj: '灵器', clGrade: '二品', clNum: 6, ls: 1500 },
  { pj: '法宝', clGrade: '三品', clNum: 8, ls: 8000 },
  { pj: '古宝', clGrade: '四品', clNum: 10, ls: 30000 },
  { pj: '灵宝', clGrade: '五品', clNum: 12, ls: 100000 },
  { pj: '后天灵宝', clGrade: '六品', clNum: 15, ls: 300000 },
  { pj: '先天灵宝', clGrade: '七品', clNum: 18, ls: 1000000 },
  { pj: '通天灵宝', clGrade: '八品', clNum: 20, ls: 3000000 }
];

const FABAO_TYPES = Object.values(FabaoType);

const randomInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

const buildFabao = (type: FabaoType, rule: CraftRule): FBItemType => {
  const typeCfg = faBaoTypeConfig.find((t) => t.itype === type);
  const tierCfg = faBaoTierConfig.find((t) => t.pj === rule.pj);
  const name = typeCfg
    ? typeCfg.parts
        .map((part) => part[Math.floor(Math.random() * part.length)])
        .join('')
    : `${rule.pj}法宝`;
  const attr: Partial<ActorDataConfigForZhanDou> = {};
  if (typeCfg && tierCfg) {
    const mainAttr = typeCfg.mainAttr as keyof ActorDataConfigForZhanDou;
    attr[mainAttr] = randomInt(tierCfg.attrRange[0], tierCfg.attrRange[1]);
    typeCfg.extraAttrs.forEach((key) => {
      if (key === 'baoji') {
        attr.baoji = randomInt(
          1,
          Math.max(2, Math.round(tierCfg.extraRange[1] / 20))
        );
      } else {
        attr[key as keyof ActorDataConfigForZhanDou] = randomInt(
          tierCfg.extraRange[0],
          tierCfg.extraRange[1]
        );
      }
    });
  }
  return {
    name,
    type: CWType.FB,
    isPile: false,
    itype: type,
    pj: rule.pj,
    attr,
    lv: 0,
    num: 1,
    desc: `以${rule.clGrade}材料锻造而成的${rule.pj}`
  };
};

export default function LianQi() {
  const { actor } = useActorController();
  const container = useContainer();
  const [selectedRule, setSelectedRule] = useState<CraftRule | null>(null);

  const qt = useMemo(() => (actor.cw?.qt || []) as any[], [actor]);

  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    qt.forEach((v) => {
      if (v && typeof v.itype === 'string') {
        counts[v.itype] = (counts[v.itype] || 0) + (v.num || 1);
      }
    });
    return counts;
  }, [qt]);

  const lsNum = useMemo(() => {
    const item = qt.find((v) => v.name === '灵石');
    return item?.num || 0;
  }, [qt]);

  const totalSlots =
    (actor.cw?.fb?.length || 0) +
    (actor.cw?.dy?.length || 0) +
    (actor.cw?.qt?.length || 0);
  const maxSlots = actor.cw?.max || 30;

  const list = useMemo<ListItemData[]>(
    () =>
      CRAFT_RULES.map((rule, index) => {
        const has = (materialCounts[rule.clGrade] || 0) >= rule.clNum;
        const hasLs = lsNum >= rule.ls;
        const ready = has && hasLs;
        return {
          key: `craft-${rule.pj}-${index}`,
          title: (
            <Box>
              <Text color={getGradeColor(rule.pj) || undefined}>{rule.pj}</Text>
              <JXSpace between>
                <Text>
                  {rule.clGrade}材料 ×{rule.clNum} + 灵石 {rule.ls}
                </Text>
                <Text color={ready ? 'green' : 'red'}>
                  {ready ? '可锻造' : '材料不足'}
                </Text>
              </JXSpace>
            </Box>
          ),
          value: `${rule.clGrade}材料：${materialCounts[rule.clGrade] || 0}/${rule.clNum} | 灵石：${lsNum}/${rule.ls}`,
          click() {
            setSelectedRule(rule);
          }
        };
      }),
    [lsNum, materialCounts]
  );

  const handleCraft = (rule: CraftRule, type: FabaoType) => {
    const clCount = materialCounts[rule.clGrade] || 0;
    if (clCount < rule.clNum) {
      JXToast(`缺少${rule.clGrade}材料，需要${rule.clNum}个`).show();
      return;
    }
    if (!chuwu.payLingshi(rule.ls)) {
      JXToast(`灵石不足，需要${rule.ls}灵石`).show();
      return;
    }
    const materials = qt.filter((v) => v.itype === rule.clGrade);
    let left = rule.clNum;
    for (const m of materials) {
      if (left <= 0) break;
      const take = Math.min(left, m.num || 1);
      chuwu.Remove({ name: m.name, type: CWType.QT, num: take });
      left -= take;
    }
    const fb = buildFabao(type, rule);
    const ok = chuwu.Add(fb);
    setSelectedRule(null);
    if (!ok) {
      JXToast('储物空间不足，锻造失败！').show();
      return;
    }
    const attrText = Object.keys(fb.attr)
      .map(
        (key) =>
          `${AttrTransformChinese(
            key as keyof ActorDataConfigForZhanDou
          )} +${fb.attr[key as keyof ActorDataConfigForZhanDou] ?? 0}`
      )
      .join('，');
    JXToast(`锻造成功！获得${rule.pj}【${fb.name}】（${attrText}）`).show();
  };

  return (
    <Container
      title='炼器'
      desc='以天材地宝为引，以三昧真火锻造，凡铁亦能化神兵。器成之日，可撼天地…'
      context={container}
      scroll
    >
      <PageHeader
        left={<Text>灵石：{lsNum}</Text>}
        right={
          <Text align='right'>
            容量：{totalSlots}/{maxSlots}
          </Text>
        }
      />
      <JXSpace
        direction='vertical'
        gap={4}
        className='attr'
        style={{ width: '100%', marginBottom: '10px' }}
      >
        <Text bold>拥有材料</Text>
        {clGrades.map((grade) => (
          <JXSpace key={grade} between>
            <Text color={getGradeColor(grade) || undefined}>{grade}</Text>
            <Text align='right'>{materialCounts[grade] || 0} 个</Text>
          </JXSpace>
        ))}
      </JXSpace>
      <Scroll calc={container.calcHeight + 50} bottomBlankSpace={30}>
        <List list={list} noFlex emptyText='暂无锻造配方' />
      </Scroll>
      <JXModal
        visible={!!selectedRule}
        title='选择法宝类型'
        cancleText='关闭'
        disableOk
        content={
          selectedRule ? (
            <JXSpace direction='vertical' gap={8}>
              <Text
                size={18}
                bold
                color={getGradeColor(selectedRule.pj) || undefined}
              >
                {selectedRule.pj}
              </Text>
              <Text>
                消耗：{selectedRule.clGrade}材料 ×{selectedRule.clNum} +{' '}
                {selectedRule.ls} 灵石
              </Text>
              <JXSpace direction='vertical' gap={6}>
                {FABAO_TYPES.map((type) => (
                  <JXButton
                    key={type}
                    size='small'
                    onClick={() => handleCraft(selectedRule, type)}
                  >
                    {type}
                  </JXButton>
                ))}
              </JXSpace>
            </JXSpace>
          ) : null
        }
        onOk={() => setSelectedRule(null)}
        onCancel={() => setSelectedRule(null)}
      />
    </Container>
  );
}
