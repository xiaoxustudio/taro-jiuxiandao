import { View } from '@tarojs/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import JXGrid from '@/components/Grid';
import TujianModal from '@/components/TujianModal';
import useModal from '@/hooks/useModal';
import useActorController from '@/hooks/useActorController';
import {
  clGrades,
  createMaterialRegistry,
  createSeedRegistry,
  flattenMaterialPool,
  MaterialRegistryItem,
  MaterialPoolByGrade,
  SeedRegistryItem
} from '@/assets/const';
import chuwu from '@/utils/chuwu';
import { checkAchievements } from '@/utils/chengjiuHelper';
import { numberToChinese, TimeArray } from '@/utils';
import { CWType, YaoyuanData } from '@/types';
import './index.less';

const getPlotSlotCount = (lv: number) => Math.min(100, 2 + Math.max(0, lv - 1));

const createDefaultPlots = (totalSlots: number, unlockedCount = 2) =>
  Array.from({ length: totalSlots }, (_, index) => ({
    id: index + 1,
    lv: 1,
    unlocked: index < unlockedCount,
    seed: null
  }));

const ensurePlotSlots = (plots: YaoyuanData['plots'], totalSlots: number) => {
  if (plots.length >= totalSlots) return plots;
  const next = [...plots];
  for (let i = plots.length; i < totalSlots; i += 1) {
    next.push({
      id: i + 1,
      lv: 1,
      unlocked: false,
      seed: null
    });
  }
  return next;
};

const createInitialSeeds = (registry: SeedRegistryItem[]) =>
  registry.slice(0, 2).map((item) => ({ ...item, num: 1 }));

const getRemainingMs = (
  seed: SeedRegistryItem & { plantTime: number },
  now: number
) => {
  const growthMs = new TimeArray(seed.time).milliseconds;
  const elapsed = now - seed.plantTime;
  return Math.max(0, growthMs - elapsed);
};
const seedDropRates: Record<(typeof clGrades)[number], number> = {
  一品: 0.03,
  二品: 0.025,
  三品: 0.02,
  四品: 0.015,
  五品: 0.012,
  六品: 0.01,
  七品: 0.008,
  八品: 0.005
};

export default function Yaoyuan() {
  const { get, set, actor } = useActorController();
  const { state: statePlot } = useModal();
  const { state: stateUpgrade } = useModal();
  const { state: stateUnlock } = useModal();
  const [activePlotId, setActivePlotId] = useState<number | null>(null);
  const [selectedSeedName, setSelectedSeedName] = useState('');
  const [tujianVisible, setTujianVisible] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const yaoyuan = useMemo(
    () => (actor?.yaoyuan as YaoyuanData | null) || null,
    [actor]
  );
  const plots = useMemo(() => yaoyuan?.plots ?? [], [yaoyuan]);
  const seeds = useMemo(() => yaoyuan?.seeds ?? [], [yaoyuan]);
  const seedRegistry = useMemo(
    () => (actor?.seedRegistry as SeedRegistryItem[]) || [],
    [actor]
  );

  useEffect(() => {
    const current = (get('yaoyuan') as YaoyuanData | null) || null;
    const baseLv = current?.lv ?? 1;
    const totalSlots = getPlotSlotCount(baseLv);
    const nextPlots = current?.plots?.length
      ? ensurePlotSlots(current.plots, totalSlots)
      : createDefaultPlots(totalSlots);

    const materialPoolByGrade = get('materialPoolByGrade') as
      | MaterialPoolByGrade
      | undefined;
    const materialRegistry =
      ((get('materialRegistry') as MaterialRegistryItem[]) || [])
        .filter((item) => item?.name)
        .map((item) => ({ name: item.name, itype: item.itype })) || [];
    const fullMaterials = materialPoolByGrade
      ? flattenMaterialPool(materialPoolByGrade)
      : [];
    const seedSource = fullMaterials.length ? fullMaterials : materialRegistry;

    let seedRegistryLocal = get('seedRegistry') as
      | SeedRegistryItem[]
      | undefined;
    if (
      !seedRegistryLocal ||
      !seedRegistryLocal.length ||
      seedRegistryLocal.length < seedSource.length
    ) {
      const fallbackMaterials =
        seedSource.length || materialRegistry.length
          ? seedSource
          : createMaterialRegistry({ seed: get('uuid') });
      seedRegistryLocal = createSeedRegistry(fallbackMaterials);
      set('seedRegistry', seedRegistryLocal);
    }

    const nextSeeds =
      Array.isArray(current?.seeds) && current.seeds.length
        ? current.seeds
        : createInitialSeeds(seedRegistryLocal);

    const shouldInit =
      !current ||
      current.plots?.length !== nextPlots.length ||
      !Array.isArray(current.seeds);

    if (shouldInit) {
      set('yaoyuan', {
        lv: baseLv,
        plots: nextPlots,
        seeds: nextSeeds
      });
    }
  }, [actor, get, set]);

  const lingshi = chuwu.getLingshi();

  const lv = yaoyuan?.lv || 1;
  const pjMemo = useMemo(() => `${numberToChinese(lv)}阶`, [lv]);
  const unlockedCount = useMemo(
    () => plots.filter((item) => item.unlocked).length,
    [plots]
  );
  const totalSlots = useMemo(() => plots.length, [plots]);
  const plot = useMemo(
    () => plots.find((item) => item.id === activePlotId) || null,
    [activePlotId, plots]
  );
  const unlockCost = useMemo(() => (plot ? plot.id * 1000 : 0), [plot]);

  const handleOpenPlot = useCallback(
    (id: number) => {
      const current = plots.find((item) => item.id === id);
      setActivePlotId(id);
      setSelectedSeedName('');
      if (current?.unlocked) {
        statePlot.setVisiableModal(true);
      } else {
        stateUnlock.setVisiableModal(true);
      }
    },
    [plots, statePlot, stateUnlock]
  );

  const updateYaoyuan = useCallback(
    (next: YaoyuanData) => {
      set('yaoyuan', next);
    },
    [set]
  );

  const handlePlant = useCallback(() => {
    if (!yaoyuan || !plot || !selectedSeedName) return;
    if (!plot.unlocked) {
      JXToast().show('灵田尚未解锁');
      return;
    }
    if (plot.seed) {
      JXToast().show('灵田已有灵药');
      return;
    }
    const target = yaoyuan.seeds.find(
      (item) => item.name === selectedSeedName && item.num > 0
    );
    if (!target) {
      JXToast().show('种子不足');
      return;
    }
    const nextSeeds = yaoyuan.seeds
      .map((item) =>
        item.name === target.name ? { ...item, num: item.num - 1 } : item
      )
      .filter((item) => item.num > 0);
    const nextPlots = yaoyuan.plots.map((item) =>
      item.id === plot.id
        ? { ...item, seed: { ...target, plantTime: Date.now() } }
        : item
    );
    updateYaoyuan({ ...yaoyuan, seeds: nextSeeds, plots: nextPlots });
    statePlot.setVisiableModal(false);
    setSelectedSeedName('');
    JXToast().show(`开始种植：${target.name}`);
  }, [plot, selectedSeedName, statePlot, updateYaoyuan, yaoyuan]);

  const handleHarvest = useCallback(() => {
    if (!yaoyuan || !plot || !plot.seed) return;
    const remaining = getRemainingMs(plot.seed, Date.now());
    if (remaining > 0) {
      JXToast().show('灵药尚未成熟');
      return;
    }
    const yieldNum = Math.max(1, plot.lv);
    const dropRate = seedDropRates[plot.seed.itype] ?? 0;
    const shouldDropSeed = Math.random() < dropRate;
    chuwu.Add({
      name: plot.seed.material,
      type: CWType.QT,
      num: yieldNum,
      isPile: true
    });
    const nextPlots = yaoyuan.plots.map((item) =>
      item.id === plot.id ? { ...item, seed: null } : item
    );
    let nextSeeds = yaoyuan.seeds;
    if (shouldDropSeed) {
      const existing = nextSeeds.find((item) => item.name === plot.seed?.name);
      nextSeeds = existing
        ? nextSeeds.map((item) =>
            item.name === plot.seed?.name
              ? { ...item, num: item.num + 1 }
              : item
          )
        : [...nextSeeds, { ...plot.seed, num: 1 }];
      JXToast().show(`获得种子：${plot.seed.name}`);
    }
    updateYaoyuan({ ...yaoyuan, plots: nextPlots, seeds: nextSeeds });
    statePlot.setVisiableModal(false);
    JXToast().show(
      shouldDropSeed
        ? `收获材料：${plot.seed.material} X ${yieldNum}，获得种子：${plot.seed.name}`
        : `收获材料：${plot.seed.material} X ${yieldNum}`
    );
  }, [plot, statePlot, updateYaoyuan, yaoyuan]);

  const handleUpgradePlot = useCallback(() => {
    if (!yaoyuan || !plot) return;
    if (!plot.unlocked) {
      JXToast().show('灵田尚未解锁');
      return;
    }
    const cost = plot.lv * 500;
    if (lingshi < cost) {
      JXToast().show('灵石不足');
      return;
    }
    chuwu.payLingshi(cost);
    const nextPlots = yaoyuan.plots.map((item) =>
      item.id === plot.id ? { ...item, lv: item.lv + 1 } : item
    );
    updateYaoyuan({ ...yaoyuan, plots: nextPlots });
    JXToast().show(`灵田升至${plot.lv + 1}级`);
  }, [lingshi, plot, updateYaoyuan, yaoyuan]);

  const handleUpgradeGarden = useCallback(() => {
    if (!yaoyuan) return;
    const needUpLingshi = lv * 2000;
    if (lv % 10 === 0) {
      if (!chuwu.consumeShengLingShi()) {
        JXToast().show('升灵石不足');
        return;
      }
    } else if (lingshi >= needUpLingshi) {
      chuwu.payLingshi(needUpLingshi);
    } else {
      JXToast().show('灵石不足');
      return;
    }
    const nextLv = lv + 1;
    const nextTotalSlots = getPlotSlotCount(nextLv);
    const nextPlots = ensurePlotSlots(yaoyuan.plots, nextTotalSlots);
    updateYaoyuan({ ...yaoyuan, lv: nextLv, plots: nextPlots });
    stateUpgrade.setVisiableModal(false);
    JXToast().show(`药园升至${nextLv}阶`);
  }, [lingshi, lv, stateUpgrade, updateYaoyuan, yaoyuan]);

  const handleUnlockPlot = useCallback(() => {
    if (!yaoyuan || !plot) return;
    if (plot.unlocked) {
      stateUnlock.setVisiableModal(false);
      return;
    }
    if (lingshi < unlockCost) {
      JXToast().show('灵石不足');
      return;
    }
    chuwu.payLingshi(unlockCost);
    const nextPlots = yaoyuan.plots.map((item) =>
      item.id === plot.id ? { ...item, unlocked: true } : item
    );
    updateYaoyuan({ ...yaoyuan, plots: nextPlots });
    stateUnlock.setVisiableModal(false);
    checkAchievements(get, set, actor);
    JXToast().show(`灵田#${plot.id}已解锁`);
  }, [
    actor,
    get,
    lingshi,
    plot,
    set,
    stateUnlock,
    unlockCost,
    updateYaoyuan,
    yaoyuan
  ]);

  const plotSeed = plot?.seed ?? null;
  const remainingMs = plotSeed ? getRemainingMs(plotSeed, Date.now()) : 0;
  let remainingText = '';
  if (plotSeed) {
    remainingText =
      remainingMs <= 0 ? '已成熟' : new TimeArray(remainingMs).toString();
  }

  return (
    <Container
      title='药园'
      desc='药园灵气氤氲，九宫灵田静待播种，细心培育方能收获天材地宝。'
    >
      <JXSpace direction='vertical' gap={6} style={{ padding: '0 10px' }}>
        <Text>
          药园品阶：{pjMemo}({lv})
        </Text>
        <Text>
          已解锁灵田：{unlockedCount}/{totalSlots}
        </Text>
      </JXSpace>
      <JXSpace style={{ margin: '10px 0', padding: '0 10px' }}>
        <JXButton
          style={{ flex: 1 }}
          onClick={() => stateUpgrade.setVisiableModal(true)}
        >
          升阶
        </JXButton>
        <JXButton style={{ flex: 1 }} onClick={() => setTujianVisible(true)}>
          图鉴
        </JXButton>
      </JXSpace>
      <View className='yaoyuan-grid'>
        <JXGrid columns={3} gap={8}>
          {plots.map((item) => {
            const seed = item.seed as
              | (SeedRegistryItem & {
                  plantTime: number;
                })
              | null;
            const remain = seed ? getRemainingMs(seed, Date.now()) : 0;
            const isMature = seed ? remain <= 0 : false;
            let plotLabel = '未解锁';
            if (item.unlocked) {
              if (seed) {
                plotLabel = `${seed.material}${isMature ? '·成熟' : '·培育'}`;
              } else {
                plotLabel = '空灵田';
              }
            }
            return (
              <JXGrid.Item key={item.id} align='center'>
                <JXButton
                  className={[
                    'yaoyuan-plot',
                    !item.unlocked && 'yaoyuan-plot--locked',
                    isMature && 'yaoyuan-plot--mature'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleOpenPlot(item.id)}
                >
                  <Text>{plotLabel}</Text>
                </JXButton>
              </JXGrid.Item>
            );
          })}
        </JXGrid>
      </View>
      <JXModal
        controller={stateUpgrade}
        title='药园升阶'
        okText='确认升阶'
        onOk={handleUpgradeGarden}
        onCancel={() => stateUpgrade.setVisiableModal(false)}
      >
        <JXSpace direction='vertical'>
          <Text>
            当前：{pjMemo}({lv})
          </Text>
          <Text>
            升阶后：{numberToChinese(lv + 1)}阶({lv + 1})
          </Text>
          <Text>
            需要灵石：{lv * 2000}（
            <Text inline color={lingshi >= lv * 2000 ? 'green' : 'red'}>
              {lingshi}
            </Text>
            ）
          </Text>
        </JXSpace>
      </JXModal>
      <JXModal
        controller={statePlot}
        title={plot ? `灵田#${plot.id}` : '灵田'}
        okText={plotSeed ? '收获' : '种植'}
        disableOk={plotSeed ? remainingMs > 0 : !selectedSeedName}
        onOk={plotSeed ? handleHarvest : handlePlant}
        onCancel={() => {
          statePlot.setVisiableModal(false);
          setSelectedSeedName('');
        }}
      >
        <JXSpace direction='vertical' gap={6}>
          {plot ? (
            <>
              <Text>灵田等级：{plot.lv}</Text>
              <Text>状态：{plot.unlocked ? '已解锁' : '未解锁'}</Text>
              {plotSeed ? (
                <>
                  <Text>灵药：{plotSeed.material}</Text>
                  <Text>成长：{remainingText}</Text>
                </>
              ) : (
                <JXSpace direction='vertical'>
                  <Text>选择种子</Text>
                  <View className='yaoyuan-seed-list'>
                    {seeds.map((item) => (
                      <JXButton
                        key={item.name}
                        className={[
                          'yaoyuan-seed',
                          selectedSeedName === item.name &&
                            'yaoyuan-seed--active'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setSelectedSeedName(item.name)}
                      >
                        {item.name} X{item.num}
                      </JXButton>
                    ))}
                    {!seeds.length && <Text>暂无种子</Text>}
                  </View>
                </JXSpace>
              )}
              <JXButton style={{ width: '100%' }} onClick={handleUpgradePlot}>
                升级灵田（{plot.lv * 500}灵石）
              </JXButton>
            </>
          ) : (
            <Text>灵田不存在</Text>
          )}
        </JXSpace>
      </JXModal>
      <JXModal
        controller={stateUnlock}
        title={plot ? `解锁灵田#${plot.id}` : '解锁灵田'}
        okText='确认解锁'
        onOk={handleUnlockPlot}
        onCancel={() => stateUnlock.setVisiableModal(false)}
      >
        <JXSpace direction='vertical' gap={6}>
          {plot ? (
            <>
              <Text>灵田等级：{plot.lv}</Text>
              <Text>状态：{plot.unlocked ? '已解锁' : '未解锁'}</Text>
              <Text>
                需要灵石：
                <Text inline color={lingshi >= unlockCost ? 'green' : 'red'}>
                  {unlockCost}
                </Text>
              </Text>
              <Text>当前灵石：{lingshi}</Text>
            </>
          ) : (
            <Text>灵田不存在</Text>
          )}
        </JXSpace>
      </JXModal>
      <TujianModal
        visible={tujianVisible}
        onClose={() => setTujianVisible(false)}
        get={get}
        set={set}
        actor={actor}
        seeds={seedRegistry}
      />
    </Container>
  );
}
