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
  ActorDataConfigForFaBao,
  RebirthKeepConfig,
  RebirthReward
} from '@/types/actor';
import { CuWuType } from '@/types';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';

const defaultRebirthKeep: RebirthKeepConfig = {
  keepLinggen: true,
  keepZhongzu: true,
  keepShouyuan: 10,
  keepXiuwei: 10
};

const rebirthRewardOptions: RebirthReward[] = [
  { type: 'xuanyuan', value: 60 },
  { type: 'shenshi', value: 50 }
];

function RebirthPage() {
  const { get, actor } = useActorController();
  const [keepConfig, setKeepConfig] = useState<RebirthKeepConfig>({
    ...defaultRebirthKeep
  });
  const [selectReward, setSelectReward] = useState<RebirthReward | null>(null);

  const maxShouyuan = useMemo(() => get('max_shouyuan'), [get]);
  const xiuwei = useMemo(() => get('xiuwei'), [get]);
  const maxXiuwei = useMemo(() => get('max_xiuwei'), [get]);

  const canRebirth = useMemo(
    () => get('shouyuan') >= maxShouyuan,
    [get, maxShouyuan]
  );

  const calculateKeptItems = useCallback(() => {
    const keptShouyuan = Math.round(
      (maxShouyuan * (keepConfig.keepShouyuan || 0)) / 100
    );
    const keptXiuwei = Math.round(
      (maxXiuwei * (keepConfig.keepXiuwei || 0)) / 100
    );
    return {
      shouyuan: keptShouyuan,
      xiuwei: keptXiuwei,
      linggen: keepConfig.keepLinggen ? get('linggen') : null,
      zhongzu: keepConfig.keepZhongzu ? get('zhongzu') : null
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
      zhongzu
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

    const baseCW: CuWuType = {
      fb: [],
      dy: [],
      qt: [],
      max: 30
    };

    const rewards: Record<string, number> = {};
    if (selectReward.value > 0) rewards[selectReward.type] = selectReward.value;

    const nextActor = {
      ...actor,
      uuid: actor?.uuid || '',
      daohao: actor?.daohao || '',
      lv: 1,
      xiuwei: keptXiuwei,
      max_xiuwei: 500,
      shenshi: 100 + (rewards.shenshi || 0),
      max_shenshi: 100 + (rewards.shenshi || 0),
      shouyuan,
      max_shouyuan: 100,
      jingjie: '练气',
      jingjie1: '一阶',
      jingjie2: '初期',
      qixue: 1200,
      gongji: 80,
      fangyu: 40,
      baoji: 2,
      sudu: 20,
      fashu: 0,
      xianyuan: 0,
      xiulianbeilv: 10,
      addAttr: {
        qixue: 0,
        gongji: 0,
        fangyu: 0,
        baoji: 0,
        sudu: 0,
        fashu: 0,
        xianyuan: 0
      },
      fabao: baseFabao,
      cw: baseCW,
      time1: Date.now(),
      shenshiTime: Date.now(),
      xiulian: null,
      qiandao: {
        count: 0,
        last: '',
        time: '',
        streak: 0
      },
      dongfu: {
        lingchi: 1000,
        lv: 1,
        daolv: null,
        daolvMarket: null,
        shuangxiu: null
      },
      zd: {
        time: 0,
        df: ''
      },
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
        ls: [],
        current: null
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
      xuanyuan: (actor?.xuanyuan || 0) + (rewards.xuanyuan || 0),
      ...(linggen && { linggen }),
      ...(zhongzu && { zhongzu }),
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
          <Text>• 所有法宝、功法将被清空</Text>
          <Text>• 储物中的材料将被清空</Text>
          <Text>• 丹方、药园、洞府数据将被重置</Text>
          <Box style={{ height: 8 }} />
          <Text>保留配置：</Text>
          {keepConfig.keepLinggen && <Text>• 灵根：{linggen}</Text>}
          {keepConfig.keepZhongzu && <Text>• 种族：{zhongzu}</Text>}
          {keepConfig.keepShouyuan! > 0 && <Text>• 寿元：{shouyuan}</Text>}
          {keepConfig.keepXiuwei! > 0 && <Text>• 修为：{keptXiuwei}</Text>}
          <Box style={{ height: 8 }} />
          <Text>
            重生奖励：{selectReward.type} +{selectReward.value}
          </Text>
        </>
      ),
      onConfirm() {
        const daohao = actor?.daohao || '';
        useActorStore.getState().set(daohao, nextActor as any);
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
      case 'xuanyuan':
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
        <Box style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
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

        <Box style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <Text size={16} bold>
            保留选项
          </Text>
          <JXSpace gap={10} style={{ marginTop: 8 }}>
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
          <JXSpace gap={10} style={{ marginTop: 8 }}>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepShouyuan: keepConfig.keepShouyuan === 0 ? 10 : 0
                })
              }
            >
              寿元 +{keepConfig.keepShouyuan || 0}%
            </JXButton>
            <JXButton
              size='mini'
              onClick={() =>
                setKeepConfig({
                  ...keepConfig,
                  keepXiuwei: keepConfig.keepXiuwei === 0 ? 10 : 0
                })
              }
            >
              修为 +{keepConfig.keepXiuwei || 0}%
            </JXButton>
          </JXSpace>
        </Box>

        <Box style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
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
