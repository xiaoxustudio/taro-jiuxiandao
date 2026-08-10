import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import { navigateTo } from '@/utils';
import {
  ActorDataConfig,
  ActorDataConfigForFaBao,
  RebirthKeepConfig,
  RebirthReward
} from '@/types/actor';
import { CuWuType, FBItemType } from '@/types';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { getLunhuiBuffs } from '@/utils/actor';

const defaultRebirthKeep: RebirthKeepConfig = {
  keepLinggen: true,
  keepZhongzu: true,
  keepShouyuan: 10,
  keepXiuwei: 10,
  keepFabao: false,
  keepGongfa: false
};

const rebirthRewardOptions: RebirthReward[] = [
  { type: 'xianyuan', value: 60 },
  { type: 'shenshi', value: 50 }
];

const SHOUYUAN_OPTIONS = [0, 10, 25, 50];
const XIUWEI_OPTIONS = [0, 10, 25, 50];

function cycleValue(current: number, options: number[]) {
  const idx = options.indexOf(current);
  return options[(idx + 1) % options.length];
}

function RebirthPage() {
  const { get, actor } = useActorController();
  const [keepConfig, setKeepConfig] = useState<RebirthKeepConfig>({
    ...defaultRebirthKeep
  });
  const [selectReward, setSelectReward] = useState<RebirthReward | null>(null);

  const maxShouyuan = useMemo(() => actor?.max_shouyuan ?? 0, [actor]);
  const xiuwei = useMemo(() => actor?.xiuwei ?? 0, [actor]);
  const maxXiuwei = useMemo(() => actor?.max_xiuwei ?? 0, [actor]);

  const canRebirth = useMemo(() => (actor?.shouyuan ?? 1) <= 0, [actor]);

  const calculateKeptItems = useCallback(() => {
    const keptShouyuan = Math.round(
      (maxShouyuan * (keepConfig.keepShouyuan || 0)) / 100
    );
    const keptXiuwei = Math.round(
      (maxXiuwei * (keepConfig.keepXiuwei || 0)) / 100
    );
    const keptFabao = keepConfig.keepFabao
      ? (Object.values(get('fabao') || {})
          .filter(Boolean)
          .slice(0, 2) as FBItemType[])
      : [];
    const keptGongfa = keepConfig.keepGongfa ? get('gongfa.current') : null;
    return {
      shouyuan: keptShouyuan,
      xiuwei: keptXiuwei,
      linggen: keepConfig.keepLinggen ? get('linggen') : null,
      zhongzu: keepConfig.keepZhongzu ? get('zhongzu') : null,
      fabao: keptFabao,
      gongfa: keptGongfa
    };
  }, [get, keepConfig, maxShouyuan, maxXiuwei]);

  const handleRebirth = useCallback(() => {
    if (!canRebirth) {
      JXToast('寿元未到极限，无法重生').show();
      return;
    }

    if (!selectReward) {
      JXToast('请选择重生奖励').show();
      return;
    }

    const {
      shouyuan,
      xiuwei: keptXiuwei,
      linggen,
      zhongzu,
      fabao: keptFabao,
      gongfa: keptGongfa
    } = calculateKeptItems();

    const baseFabao: ActorDataConfigForFaBao = {
      手持武器: null,
      头戴战盔: null,
      身穿战甲: null,
      腰带护具: null,
      饰品加持: null,
      鞋子护腿: null,
      魂器镇魂: null,
      本名法宝: null
    };

    const lunhuiCount = (actor?.lunhuiCount as number) || 0;
    const newLunhuiCount = lunhuiCount + 1;
    const prevMax = (actor?.cw?.max as number) || 30;
    const baseCW: CuWuType = {
      fb: [],
      dy: [],
      qt: [],
      max: Math.max(30, prevMax, newLunhuiCount * 20 + 30)
    };

    if (keptFabao.length > 0) {
      const slotKeys = Object.keys(
        baseFabao
      ) as (keyof ActorDataConfigForFaBao)[];
      keptFabao.forEach((item, i) => {
        if (i < slotKeys.length) {
          (baseFabao as any)[slotKeys[i]] = item;
        }
      });
    }

    const rewards: Record<string, number> = {};
    if (selectReward.value > 0) rewards[selectReward.type] = selectReward.value;
    const lunhuiBuffs = getLunhuiBuffs(newLunhuiCount);
    const lunhuiShenshiBonus = lunhuiBuffs?.maxShenshiBonus || 0;
    const lunhuiShouyuanBonus = lunhuiBuffs?.shouyuanBonus || 0;
    const lunhuiXiulianBonus = lunhuiBuffs?.xiulianbeilvBonus || 0;
    const lunhuiXiuweiBonus = lunhuiBuffs?.initialXiuweiBonus || 0;
    const newMaxShouyuan = Math.max(100 + lunhuiShouyuanBonus, shouyuan + 100);

    const nextActor = {
      ...actor,
      uuid: actor?.uuid || '',
      daohao: actor?.daohao || '',
      lv: 1,
      xiuwei: keptXiuwei + lunhuiXiuweiBonus,
      max_xiuwei: 500,
      shenshi: 100 + (rewards.shenshi || 0) + lunhuiShenshiBonus,
      max_shenshi: 100 + (rewards.shenshi || 0) + lunhuiShenshiBonus,
      shouyuan: Math.min(shouyuan, newMaxShouyuan),
      max_shouyuan: newMaxShouyuan,
      jingjie: '练气',
      jingjie1: '一阶',
      jingjie2: '初期',
      qixue: 1200,
      gongji: 80,
      fangyu: 40,
      baoji: 2,
      sudu: 20,
      fashu: 0,
      xiulianbeilv: 10 + lunhuiXiulianBonus,
      addAttr: {
        qixue: 0,
        gongji: 0,
        fangyu: 0,
        baoji: 0,
        sudu: 0,
        fashu: 0
      },
      fabao: baseFabao,
      cw: baseCW,
      time1: Date.now(),
      shenshiTime: Date.now(),
      xiulian: null,
      qiandao: { count: 0, last: '', time: '', streak: 0 },
      dongfu: {
        lingchi: 1000,
        lv: 1,
        daolv: null,
        daolvMarket: null,
        shuangxiu: null
      },
      zd: { time: 0, df: '' },
      liandan: {
        chenghao: '丹徒',
        exp: 0,
        max_exp: 100,
        danlu: null,
        danyao: null,
        danyun: 0,
        time: 0
      },
      danfang: [],
      gongfa: {
        ls: keptGongfa ? [keptGongfa] : [],
        current: keptGongfa || null
      },
      yaoyuan: {
        lv: 1,
        plots: Array.from({ length: 2 }, (_, i) => ({
          id: i + 1,
          lv: 1,
          unlocked: true,
          seed: null
        })),
        seeds: []
      },
      xianyuan: (actor?.xianyuan || 0) + (rewards.xianyuan || 0),
      ...(linggen && { linggen }),
      ...(zhongzu && { zhongzu }),
      lunhuiCount: newLunhuiCount,
      chengjiu: undefined,
      battleCount: undefined,
      winStreak: undefined
    };

    JXModal.confirm({
      title: '确认重生',
      content: (
        <>
          <Text>重生后将重置以下内容：</Text>
          <Text>• 等级、境界、属性将重置为初始值</Text>
          <Text>• 储物中的材料、丹药将被清空</Text>
          <Text>• 丹方、药园、洞府数据将被重置</Text>
          <Box style={{ height: 8 }} />
          <Text>保留配置：</Text>
          {keepConfig.keepLinggen && <Text>• 灵根：{linggen}</Text>}
          {keepConfig.keepZhongzu && <Text>• 种族：{zhongzu}</Text>}
          {keepConfig.keepShouyuan! > 0 && <Text>• 寿元：{shouyuan}</Text>}
          {keepConfig.keepXiuwei! > 0 && <Text>• 修为：{keptXiuwei}</Text>}
          {keptFabao.length > 0 && (
            <Text>• 法宝：{keptFabao.map((f) => f.name).join('、')}</Text>
          )}
          {keptGongfa && <Text>• 功法：{keptGongfa.name}</Text>}
          <Box style={{ height: 8 }} />
          <Text>
            重生奖励：{selectReward.type === 'xianyuan' ? '仙缘' : '神识上限'} +
            {selectReward.value}
          </Text>
        </>
      ),
      onConfirm() {
        const daohao = actor?.daohao || '';
        useActorStore.getState().set(daohao, nextActor as ActorDataConfig);
        useStore.getState().set(daohao);
        JXToast('重生成功！').show();
        setTimeout(() => {
          navigateTo('Main/index', { all: true });
        }, 1000);
      }
    });
  }, [actor, canRebirth, calculateKeptItems, keepConfig, selectReward]);

  const handleGoHome = useCallback(() => {
    navigateTo('index/index', { replace: true });
  }, []);

  const formatRewardLabel = (reward: RebirthReward) => {
    switch (reward.type) {
      case 'xianyuan':
        return `仙缘 +${reward.value}`;
      case 'shenshi':
        return `神识上限 +${reward.value}`;
      default:
        return `${reward.type} +${reward.value}`;
    }
  };

  return (
    <Container
      title='重生'
      desc='寿元已到极限，无法继续修仙之路。选择重生，重获新生...'
    >
      <JXSpace direction='vertical' gap={15}>
        <Box className='card'>
          <Text size={16} bold>
            当前状态：寿元已到极限
          </Text>
          <Text>
            寿元：{get('shouyuan')}/{maxShouyuan}
          </Text>
          <Text>
            修为：{xiuwei}/{maxXiuwei}
          </Text>
        </Box>

        <Box className='card'>
          <Text size={16} bold>
            保留选项
          </Text>
          <JXSpace gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepLinggen: !keepConfig.keepLinggen
                })
              }
            >
              灵根 {keepConfig.keepLinggen ? '✓' : '○'} {get('linggen')}
            </JXButton>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepZhongzu: !keepConfig.keepZhongzu
                })
              }
            >
              种族 {keepConfig.keepZhongzu ? '✓' : '○'} {get('zhongzu')}
            </JXButton>
          </JXSpace>
          <JXSpace gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepShouyuan: cycleValue(
                    keepConfig.keepShouyuan || 0,
                    SHOUYUAN_OPTIONS
                  )
                })
              }
            >
              寿元 {keepConfig.keepShouyuan || 0}%
            </JXButton>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepXiuwei: cycleValue(
                    keepConfig.keepXiuwei || 0,
                    XIUWEI_OPTIONS
                  )
                })
              }
            >
              修为 {keepConfig.keepXiuwei || 0}%
            </JXButton>
          </JXSpace>
          <JXSpace gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepFabao: !keepConfig.keepFabao
                })
              }
            >
              法宝 {keepConfig.keepFabao ? '✓ 保留前2件' : '○ 不保留'}
            </JXButton>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepGongfa: !keepConfig.keepGongfa
                })
              }
            >
              功法 {keepConfig.keepGongfa ? '✓ 保留当前' : '○ 不保留'}
            </JXButton>
          </JXSpace>
        </Box>

        <Box className='card'>
          <Text size={16} bold>
            选择重生奖励
          </Text>
          <JXSpace gap={10} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {[...rebirthRewardOptions].map((reward, idx) => (
              <JXButton
                key={`${reward.type}-${idx}`}
                size='mini'
                onClick={() => setSelectReward(reward)}
              >
                {selectReward?.type === reward.type &&
                selectReward?.value === reward.value
                  ? '✓ '
                  : ''}
                {formatRewardLabel(reward)}
              </JXButton>
            ))}
          </JXSpace>
        </Box>

        <JXSpace gap={15}>
          <JXButton
            width={200}
            onClick={handleRebirth}
            disabled={!canRebirth || !selectReward}
          >
            确认重生
          </JXButton>
          <JXButton width={200} onClick={handleGoHome}>
            返回主页
          </JXButton>
        </JXSpace>
      </JXSpace>
    </Container>
  );
}

export default RebirthPage;
