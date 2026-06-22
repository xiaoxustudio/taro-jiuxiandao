import { View } from '@tarojs/components';
import { DotLoading, Selector } from 'antd-mobile';
import { useCallback, useMemo, useState } from 'react';
import {
  JXButton,
  JXInput,
  JXModal,
  JXSpace,
  JXToast,
  Text
} from '@/components';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import useStorageStore from '@/services/storage';
import { ActorDataConfig, CWType } from '@/types';
import { UUID, navigateBack } from '@/utils';
import { HasActor } from '@/utils/actor';
import { GongFaPinJie, GongFaType } from '@/types/gongfa';
import {
  clGrades,
  clNameParts,
  createSeedRegistry,
  createRng,
  dfGrades,
  dyGradeMultipliers,
  dyNameParts,
  dyRarityLevels,
  dyRarityMultipliers,
  DY_EFFECT_SCALE,
  FANGSHI_CONFIG,
  ACTOR_POOL_CONFIG,
  flattenMaterialPool,
  MaterialPoolByGrade,
  MATERIAL_BASE_LIST,
  REALM_ORDER,
  XIUXIAN_TIME_SCALE_DEFAULT
} from '@/assets/const';
import styles from './index.module.less';

const buildName = (parts: readonly (readonly string[])[], rng: () => number) =>
  parts.map((p) => p[Math.floor(rng() * p.length)]).join('');

const yieldToMain = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const storageSet = async (key: string, data: any) => {
  const { set } = useStorageStore.getState();
  await set(key, data);
};

const storageRemove = async (key: string) => {
  const { remove } = useStorageStore.getState();
  await remove(key);
};

const rollbackStoredKeys = async (keys: string[]) => {
  if (!keys.length) return;
  await Promise.allSettled(keys.map((k) => storageRemove(k)));
};

const pickRarity = (p: number) => {
  if (p < 0.5) return dyRarityLevels[0];
  if (p < 0.75) return dyRarityLevels[1];
  if (p < 0.9) return dyRarityLevels[2];
  if (p < 0.97) return dyRarityLevels[3];
  return dyRarityLevels[4];
};

const getGradeIndex = (grade: string, grades: readonly string[]) => {
  const idx = grades.indexOf(grade);
  return idx === -1 ? 0 : idx;
};

const getYaoyuanTotalSlots = (lv: number) =>
  Math.min(100, 2 + Math.max(0, lv - 1));

const createDefaultYaoyuanPlots = (totalSlots: number, unlockedCount = 2) =>
  Array.from({ length: totalSlots }, (_, index) => ({
    id: index + 1,
    lv: 1,
    unlocked: index < unlockedCount,
    seed: null
  }));

const createInitialSeeds = (registry: ReturnType<typeof createSeedRegistry>) =>
  registry.slice(0, 2).map((item) => ({ ...item, num: 1 }));

const dfNameSuffixPool = [
  '玄',
  '灵',
  '真',
  '太',
  '元',
  '清',
  '虚',
  '明',
  '化',
  '归',
  '无',
  '极',
  '道'
] as const;

const gongfaGrades = [
  GongFaPinJie.一品,
  GongFaPinJie.二品,
  GongFaPinJie.三品,
  GongFaPinJie.四品,
  GongFaPinJie.五品,
  GongFaPinJie.六品,
  GongFaPinJie.七品,
  GongFaPinJie.八品
] as const;
const gongfaNameParts = [
  ['玄', '灵', '太', '清', '青', '赤', '苍', '紫', '金', '幽'],
  ['元', '真', '阳', '阴', '雷', '火', '风', '冰', '星', '月'],
  ['诀', '功', '经', '法', '录', '典', '术']
] as const;
const gongfaAttrKeys = ['gongji', 'fangyu', 'qixue', 'sudu'] as const;

const options = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        金灵根
      </Text>
    ),
    value: '金'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        木灵根
      </Text>
    ),
    value: '木'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        水灵根
      </Text>
    ),
    value: '水'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        火灵根
      </Text>
    ),
    value: '火'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        土灵根
      </Text>
    ),
    value: '土'
  }
];

const races = [
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        人族
      </Text>
    ),
    value: '人'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        魔族
      </Text>
    ),
    value: '魔'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        妖族
      </Text>
    ),
    value: '妖'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        鬼族
      </Text>
    ),
    value: '鬼'
  },
  {
    label: (
      <Text className={styles.LingGenItem} space={10} center verticalText>
        灵族
      </Text>
    ),
    value: '灵'
  }
];

function Index() {
  const { set: setStore } = useStore();
  const { set: setActorStore } = useActorStore();
  const [genState, setGenState] = useState<{
    visible: boolean;
    phase: '材料' | '丹方' | '功法';
    done: number;
    total: number;
    name: string;
  }>({ visible: false, phase: '材料', done: 0, total: 0, name: '' });
  const [actor, setActor] = useState<ActorDataConfig>({
    uuid: UUID(),
    daohao: '',
    linggen: '金',
    zhongzu: '人',
    lv: 1,
    xiuwei: 0, // 修为
    max_xiuwei: 500,
    xianyuan: 10, // 仙缘
    jingjie: '练气',
    jingjie1: '一阶',
    jingjie2: '初期',
    xiulianbeilv: 10, // 修炼倍率
    qixue: 1200, // 气血
    gongji: 80, // 攻击
    fangyu: 40, // 防御
    baoji: 2, // 暴击
    sudu: 20, // 速度
    fashu: 0, // 法术
    shouyuan: 60, // 寿元
    max_shouyuan: 100,
    shenshi: 100, // 神识
    max_shenshi: 100,
    addAttr: {
      // 加成属性
      qixue: 0, // 气血
      gongji: 0, // 攻击
      fangyu: 0, // 防御
      baoji: 0, // 暴击
      sudu: 0, // 速度
      fashu: 0,
      xianyuan: 0 // 仙缘
    },
    fabao: {
      手持武器: null,
      头戴战盔: null,
      身穿战甲: null,
      腰带护具: null,
      饰品加持: null,
      鞋子护腿: null,
      魂器镇魂: null,
      本名法宝: null
    },
    cw: {
      fb: [],
      dy: [],
      qt: [],
      max: 30 // 容量
    },
    time1: Date.now(), // 时间1 （计算寿元）
    xiuxianStartAt: Date.now(),
    xiuxianTimeScale: XIUXIAN_TIME_SCALE_DEFAULT,
    shenshiTime: Date.now(), // 计算神识
    qiandao: {
      count: 0,
      last: '',
      time: '',
      streak: 0
    },
    xiulian: null,
    dongfu: {
      lingchi: 1000,
      lv: 1,
      daolv: null,
      daolvMarket: null,
      shuangxiu: null
    },
    // dongfu: null,
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
      completeTime: 0,
      time: 0
    },
    danfang: [],
    gongfa: {
      ls: [],
      current: null
    },
    yaoyuan: {
      lv: 1,
      plots: createDefaultYaoyuanPlots(getYaoyuanTotalSlots(1)),
      seeds: []
    }
  });

  const progressText = useMemo(() => {
    const total = Math.max(1, genState.total);
    const done = Math.min(total, Math.max(0, genState.done));
    const pct = Math.floor((done / total) * 100);
    return `${genState.phase}生成中：${done}/${total}（${pct}%）`;
  }, [genState.done, genState.phase, genState.total]);

  const handleRegister = useCallback(async () => {
    if (actor.daohao.length === 0) {
      JXToast('请输入你的道号').show();
      return;
    }
    if (HasActor(actor.daohao)) {
      JXToast('已有该道号的角色').show();
      return;
    }

    try {
      const seed = actor.uuid;
      const { countPerGrade, gongfaCountPerGrade } = ACTOR_POOL_CONFIG;
      const materialTotal = clGrades.length * countPerGrade;
      const danfangTotal = dfGrades.length * countPerGrade;
      const gongfaTotal = gongfaGrades.length * gongfaCountPerGrade;
      const storedKeys: string[] = [];
      const materialPoolStorageKeysByGrade: Record<string, string> = {};
      const danfangPoolStorageKeysByGrade: Record<string, string> = {};
      const gongfaPoolStorageKeysByGrade: Record<string, string> = {};
      const materialRng = createRng(`${seed}:material`);
      const danfangRng = createRng(`${seed}:danfang`);
      const gongfaRng = createRng(`${seed}:gongfa`);
      const dfNameParts = dyNameParts.slice(0, 2);

      setGenState({
        visible: true,
        phase: '材料',
        done: 0,
        total: materialTotal,
        name: ''
      });

      const materialPoolByGrade: MaterialPoolByGrade = clGrades.reduce(
        (acc, grade) => {
          acc[grade] = [];
          return acc;
        },
        {} as MaterialPoolByGrade
      );
      const materialUsed = new Set<string>();

      let materialDone = 0;

      for (const item of MATERIAL_BASE_LIST) {
        materialUsed.add(item.name);
        materialPoolByGrade[item.itype].push(item);
        materialDone += 1;
        setGenState({
          visible: true,
          phase: '材料',
          done: materialDone,
          total: materialTotal,
          name: item.name
        });
      }

      const fillMaterialGrade = async (gradeIdx: number): Promise<void> => {
        if (gradeIdx >= clGrades.length) return;
        const grade = clGrades[gradeIdx];
        const existing = materialPoolByGrade[grade]?.length ?? 0;
        const need = Math.max(0, countPerGrade - existing);

        const fillMaterialChunk = async (remaining: number): Promise<void> => {
          if (remaining <= 0) return;
          const chunkSize = Math.min(25, remaining);
          let lastName = '';
          for (let i = 0; i < chunkSize; i += 1) {
            let name = buildName(clNameParts, materialRng);
            let guard = 0;
            while (materialUsed.has(name) && guard < 5) {
              name = buildName(clNameParts, materialRng);
              guard += 1;
            }
            if (materialUsed.has(name)) {
              const baseName = name;
              let candidate = baseName;
              let suffixGuard = 0;
              while (materialUsed.has(candidate) && suffixGuard < 16) {
                const suffix =
                  dfNameSuffixPool[
                    Math.floor(materialRng() * dfNameSuffixPool.length)
                  ] || dfNameSuffixPool[0];
                candidate = `${baseName}${suffix}`;
                suffixGuard += 1;
              }
              if (materialUsed.has(candidate)) {
                let candidate2 = candidate;
                let suffixGuard2 = 0;
                while (materialUsed.has(candidate2) && suffixGuard2 < 24) {
                  const s1 =
                    dfNameSuffixPool[
                      Math.floor(materialRng() * dfNameSuffixPool.length)
                    ] || dfNameSuffixPool[0];
                  const s2 =
                    dfNameSuffixPool[
                      Math.floor(materialRng() * dfNameSuffixPool.length)
                    ] || dfNameSuffixPool[0];
                  candidate2 = `${baseName}${s1}${s2}`;
                  suffixGuard2 += 1;
                }
                candidate = candidate2;
              }
              name = candidate;
            }
            materialUsed.add(name);
            materialPoolByGrade[grade].push({ name, itype: grade });
            materialDone += 1;
            lastName = name;
          }
          setGenState({
            visible: true,
            phase: '材料',
            done: materialDone,
            total: materialTotal,
            name: lastName
          });
          await yieldToMain();
          await fillMaterialChunk(remaining - chunkSize);
        };

        await fillMaterialChunk(need);

        const storageKey = `actor:${seed}:materialPoolByGrade:${grade}`;
        try {
          await storageSet(
            storageKey,
            materialPoolByGrade[grade].map((m) => m.name)
          );
        } catch (e: any) {
          await rollbackStoredKeys(storedKeys);
          throw new Error(
            e?.message || '存档空间不足，无法保存材料数据，请清理存档后重试'
          );
        }
        storedKeys.push(storageKey);
        materialPoolStorageKeysByGrade[grade] = storageKey;

        await fillMaterialGrade(gradeIdx + 1);
      };

      await fillMaterialGrade(0);

      setGenState({
        visible: true,
        phase: '丹方',
        done: 0,
        total: danfangTotal,
        name: ''
      });

      const danfangPoolByGrade: Record<string, any[]> = dfGrades.reduce(
        (acc, grade) => {
          acc[grade] = [];
          return acc;
        },
        {} as Record<string, any[]>
      );

      const materialFlat = clGrades.flatMap(
        (g) => materialPoolByGrade[g] ?? []
      );

      const usageCounts = new Map<string, number>();
      const usedDanfangName = new Set<string>();
      let danfangDone = 0;

      const fillDanfangGrade = async (gradeIdx: number): Promise<void> => {
        if (gradeIdx >= dfGrades.length) return;
        const grade = dfGrades[gradeIdx];
        const dfGradeIndex = getGradeIndex(grade, dfGrades);
        const allowedMaterials = materialFlat.filter(
          (m) => getGradeIndex(m.itype, clGrades) <= dfGradeIndex
        );
        const pool = allowedMaterials.length ? allowedMaterials : materialFlat;

        const fillDanfangChunk = async (start: number): Promise<void> => {
          if (start >= countPerGrade) return;
          const chunkSize = Math.min(10, countPerGrade - start);
          let lastName = '';
          for (let offset = 0; offset < chunkSize; offset += 1) {
            const i = start + offset;
            let baseName = buildName(dfNameParts, danfangRng);
            let guard = 0;
            while (usedDanfangName.has(baseName) && guard < 20) {
              baseName = buildName(dfNameParts, danfangRng);
              guard += 1;
            }
            if (usedDanfangName.has(baseName)) {
              let candidate = baseName;
              let suffixGuard = 0;
              while (usedDanfangName.has(candidate) && suffixGuard < 8) {
                const suffix =
                  dfNameSuffixPool[
                    Math.floor(danfangRng() * dfNameSuffixPool.length)
                  ] || dfNameSuffixPool[0];
                candidate = `${baseName}${suffix}`;
                suffixGuard += 1;
              }
              baseName = candidate;
            }
            usedDanfangName.add(baseName);

            const isShen = danfangRng() < 0.5;
            const scale =
              (DY_EFFECT_SCALE as unknown as Record<string, any>)[grade] ??
              (DY_EFFECT_SCALE as unknown as Record<string, any>)[dfGrades[0]];
            const valRange = isShen ? scale.shenshi : scale.xiuwei;
            const baseVal =
              valRange[0] === valRange[1]
                ? valRange[0]
                : Math.floor(danfangRng() * (valRange[1] - valRange[0] + 1)) +
                  valRange[0];
            const safeBaseVal = Math.max(
              1,
              Number.isFinite(baseVal) ? baseVal : valRange[0]
            );
            const attr: Record<string, number> = isShen
              ? { shenshi: safeBaseVal }
              : { xiuwei: safeBaseVal };
            const priceRange = scale.price;
            const t =
              valRange[1] === valRange[0]
                ? 0
                : (safeBaseVal - valRange[0]) / (valRange[1] - valRange[0]);
            const priceBase = Math.round(
              priceRange[0] + t * (priceRange[1] - priceRange[0])
            );
            const rarity = pickRarity(danfangRng());
            const gradeMul =
              (dyGradeMultipliers as unknown as Record<string, number>)[
                grade
              ] ?? 1;
            const rarityMul =
              (dyRarityMultipliers as unknown as Record<string, number>)[
                rarity
              ] ?? 1;
            const safePriceBase = Math.max(
              1,
              Number.isFinite(priceBase) ? priceBase : priceRange[0]
            );
            const baseLs = Math.max(
              1,
              Math.round(safePriceBase * gradeMul * rarityMul)
            );

            const pickCount = Math.min(
              pool.length,
              Math.max(
                2,
                2 + Math.floor(dfGradeIndex / 2) + (danfangRng() < 0.5 ? 0 : 1)
              )
            );

            const picked: { name: string; itype: string }[] = [];
            const mutablePool = [...pool] as any[];
            for (let j = 0; j < pickCount && mutablePool.length; j += 1) {
              const safeMutable = mutablePool.filter(
                (v) => !!v && typeof v.name === 'string'
              );
              if (!safeMutable.length) break;
              let minUsage = Infinity;
              for (const item of safeMutable) {
                const usedCount = usageCounts.get(item.name) ?? 0;
                if (usedCount < minUsage) minUsage = usedCount;
              }
              const candidates = safeMutable.filter(
                (item) => (usageCounts.get(item.name) ?? 0) <= minUsage + 1
              );
              const targetPool = candidates.length ? candidates : safeMutable;
              const idx = Math.floor(danfangRng() * targetPool.length);
              const pickedItem = targetPool[idx];
              if (pickedItem) {
                const removeIndex = mutablePool.findIndex(
                  (x: any) => x?.name === pickedItem.name
                );
                if (removeIndex >= 0) mutablePool.splice(removeIndex, 1);
                picked.push(pickedItem);
                usageCounts.set(
                  pickedItem.name,
                  (usageCounts.get(pickedItem.name) ?? 0) + 1
                );
              }
            }

            const cl = picked.map((m): [string, number] => {
              const clGradeIndex = getGradeIndex(m.itype, clGrades);
              const minNum = 1 + Math.max(0, dfGradeIndex - clGradeIndex);
              const maxNum =
                3 + dfGradeIndex + Math.max(0, dfGradeIndex - clGradeIndex);
              const baseNum =
                maxNum === minNum
                  ? minNum
                  : Math.floor(danfangRng() * (maxNum - minNum + 1)) + minNum;
              const numScale = 0.85 + danfangRng() * 0.5;
              return [m.name, Math.max(1, Math.round(baseNum * numScale))];
            });

            const time = [
              Math.max(0, Math.floor(dfGradeIndex / 3)),
              Math.min(12, dfGradeIndex * 2),
              Math.floor(danfangRng() * (11 + dfGradeIndex * 3)) + 5
            ];

            const id = `r-${seed}-${grade}-${i}`;
            const danfangItem = {
              id,
              name: `${baseName}丹方`,
              type: 5,
              isPile: true,
              itype: grade,
              desc: isShen ? '恢复神识的丹药' : '增加修为的丹药',
              attr,
              cl,
              time,
              baseLs,
              ls: Math.max(1, Math.round(baseLs * FANGSHI_CONFIG.dfPriceScale))
            };

            danfangPoolByGrade[grade].push(danfangItem);
            danfangDone += 1;
            lastName = danfangItem.name;
          }

          setGenState({
            visible: true,
            phase: '丹方',
            done: danfangDone,
            total: danfangTotal,
            name: lastName
          });
          await yieldToMain();
          await fillDanfangChunk(start + chunkSize);
        };

        await fillDanfangChunk(0);

        const storageKey = `actor:${seed}:danfangPoolByGrade:${grade}`;
        try {
          await storageSet(storageKey, danfangPoolByGrade[grade]);
        } catch (e: any) {
          await rollbackStoredKeys(storedKeys);
          throw new Error(
            e?.message || '存档空间不足，无法保存丹方数据，请清理存档后重试'
          );
        }
        storedKeys.push(storageKey);
        danfangPoolStorageKeysByGrade[grade] = storageKey;

        await fillDanfangGrade(gradeIdx + 1);
      };

      await fillDanfangGrade(0);

      setGenState({
        visible: true,
        phase: '功法',
        done: 0,
        total: gongfaTotal,
        name: ''
      });

      const gongfaPoolByGrade = gongfaGrades.reduce(
        (acc, grade) => {
          acc[grade] = [];
          return acc;
        },
        {} as Record<(typeof gongfaGrades)[number], GongFaType[]>
      );
      const usedGongfaNames = new Set<string>();
      let gongfaDone = 0;

      const nextGongfaName = () => {
        let name = buildName(gongfaNameParts, gongfaRng);
        let guard = 0;
        while (usedGongfaNames.has(name) && guard < 8) {
          name = buildName(gongfaNameParts, gongfaRng);
          guard += 1;
        }
        if (usedGongfaNames.has(name)) {
          let candidate = name;
          let suffixGuard = 0;
          while (usedGongfaNames.has(candidate) && suffixGuard < 12) {
            const suffix =
              dfNameSuffixPool[
                Math.floor(gongfaRng() * dfNameSuffixPool.length)
              ] || dfNameSuffixPool[0];
            candidate = `${name}${suffix}`;
            suffixGuard += 1;
          }
          name = candidate;
        }
        usedGongfaNames.add(name);
        return name;
      };

      const fillGongfaGrade = async (gradeIndex: number): Promise<void> => {
        if (gradeIndex >= gongfaGrades.length) return;
        const grade = gongfaGrades[gradeIndex];
        const limit =
          REALM_ORDER[Math.min(gradeIndex, REALM_ORDER.length - 1)] ||
          REALM_ORDER[0];
        const maxExp = 800 + gradeIndex * 200;
        const xl = `${Math.max(1, Math.round(3 + gradeIndex * 2))}%`;

        const fillGongfaChunk = async (remaining: number): Promise<void> => {
          if (remaining <= 0) return;
          const chunkSize = Math.min(6, remaining);
          let lastName = '';
          for (let i = 0; i < chunkSize; i += 1) {
            const name = nextGongfaName();
            const mainKey =
              gongfaAttrKeys[Math.floor(gongfaRng() * gongfaAttrKeys.length)] ||
              gongfaAttrKeys[0];
            const baseMin = 6 + gradeIndex * 4;
            const baseMax = 12 + gradeIndex * 6;
            const mainVal =
              baseMax <= baseMin
                ? baseMin
                : Math.round(baseMin + gongfaRng() * (baseMax - baseMin));
            const attr: Record<string, number> = {
              [mainKey]: Math.max(1, mainVal)
            };
            if (gongfaRng() < 0.4) {
              const secondKey =
                gongfaAttrKeys[
                  Math.floor(gongfaRng() * gongfaAttrKeys.length)
                ] || gongfaAttrKeys[0];
              if (!attr[secondKey]) {
                const secondVal = Math.max(
                  1,
                  Math.round(mainVal * (0.35 + gongfaRng() * 0.3))
                );
                attr[secondKey] = secondVal;
              }
            }
            gongfaPoolByGrade[grade].push({
              id: UUID(),
              name,
              pj: grade,
              lv: 0,
              exp: 0,
              max_exp: maxExp,
              lg: `${actor.linggen}灵根`,
              limit,
              xl,
              attr
            });
            gongfaDone += 1;
            lastName = name;
          }
          setGenState({
            visible: true,
            phase: '功法',
            done: gongfaDone,
            total: gongfaTotal,
            name: lastName
          });
          await yieldToMain();
          await fillGongfaChunk(remaining - chunkSize);
        };

        await fillGongfaChunk(gongfaCountPerGrade);
        await fillGongfaGrade(gradeIndex + 1);
      };

      await fillGongfaGrade(0);

      const gongfaKeyEntries = Object.keys(gongfaPoolByGrade).map((grade) => ({
        grade,
        storageKey: `actor:${seed}:gongfaPoolByGrade:${grade}`
      }));
      try {
        await Promise.all(
          gongfaKeyEntries.map(({ grade, storageKey }) =>
            storageSet(storageKey, gongfaPoolByGrade[grade])
          )
        );
      } catch (e: any) {
        await rollbackStoredKeys([
          ...storedKeys,
          ...gongfaKeyEntries.map((item) => item.storageKey)
        ]);
        throw new Error(
          e?.message || '存档空间不足，无法保存功法数据，请清理存档后重试'
        );
      }
      gongfaKeyEntries.forEach(({ grade, storageKey }) => {
        storedKeys.push(storageKey);
        gongfaPoolStorageKeysByGrade[grade] = storageKey;
      });

      const materialRegistry = materialFlat.length
        ? materialFlat
        : flattenMaterialPool(materialPoolByGrade);
      const seedRegistry = createSeedRegistry(materialRegistry);
      const seedRegistryStorageKey = `actor:${seed}:seedRegistry`;
      try {
        await storageSet(seedRegistryStorageKey, seedRegistry);
      } catch (e: any) {
        await rollbackStoredKeys(storedKeys);
        throw new Error(
          e?.message || '存档空间不足，无法保存种子数据，请清理存档后重试'
        );
      }
      storedKeys.push(seedRegistryStorageKey);
      const yaoyuan = {
        lv: 1,
        plots: createDefaultYaoyuanPlots(getYaoyuanTotalSlots(1)),
        seeds: createInitialSeeds(seedRegistry)
      };
      const starterGrade = gongfaGrades[0];
      const starterPool = gongfaPoolByGrade[starterGrade] || [];
      const starterIndex = starterPool.length
        ? Math.floor(gongfaRng() * starterPool.length)
        : -1;
      const starter = starterIndex >= 0 ? starterPool[starterIndex] : undefined;
      const starterGongfa = starter
        ? {
            ...starter,
            id: UUID(),
            attr: { ...starter.attr }
          }
        : undefined;

      const nextActor: ActorDataConfig = {
        ...actor,
        materialRegistry,
        seedRegistry,
        seedRegistryStorageKey,
        yaoyuan,
        materialPoolByGrade,
        danfangPoolByGrade,
        materialPoolStorageKeysByGrade,
        danfangPoolStorageKeysByGrade,
        gongfaPoolByGrade,
        gongfaPoolStorageKeysByGrade,
        gongfa: {
          ls: starterGongfa ? [starterGongfa] : actor.gongfa.ls,
          current: null
        },
        cw: {
          ...actor.cw,
          qt: [
            ...actor.cw.qt,
            { name: '灵石', type: CWType.QT, isPile: true, num: 3000 }
          ]
        }
      };

      setActorStore(actor.daohao, nextActor);
      setStore(actor.daohao);
      JXToast().show('创建角色成功');
      setTimeout(() => {
        navigateBack({ delta: 1 });
      }, 1000);
    } catch (e: any) {
      JXToast(e?.message || '创建角色失败').show();
    } finally {
      setGenState((s) => ({ ...s, visible: false }));
    }
  }, [actor, setActorStore, setStore]);

  return (
    <View className={styles.Container}>
      <JXSpace className={styles.Container} direction='vertical'>
        <View className={styles.Title}>
          创建角色
          <Text size={14} color='#ccc' inline>
            ({actor.daohao.length}/10)
          </Text>
        </View>
        <View>
          <JXInput
            className={styles.Input}
            placeholder='请输入你的角色名称'
            value={actor.daohao}
            maxLength={10}
            onChange={(v) => setActor({ ...actor, daohao: v })}
          />
        </View>
        {/* 灵根 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你的角色
          </Text>
          <JXSpace>
            <Selector
              options={options}
              defaultValue={[actor.linggen]}
              onChange={(arr) => setActor({ ...actor, linggen: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        {/* 种猪 */}
        <JXSpace direction='vertical'>
          <Text size={16} color='#555' bold>
            请选择你出身种族
          </Text>
          <JXSpace>
            <Selector
              options={races}
              defaultValue={[actor.zhongzu]}
              onChange={(arr) => setActor({ ...actor, zhongzu: arr[0] })}
              style={{ '--padding': '0' }}
            />
          </JXSpace>
        </JXSpace>
        <JXSpace className={styles.Bottom} gap={20}>
          <JXButton width={200} onClick={handleRegister}>
            创建角色
          </JXButton>
        </JXSpace>
      </JXSpace>
      <JXModal
        visible={genState.visible}
        disableOk
        disableCancle
        closeOnMaskClick={false}
        closeOnAction={false}
      >
        <JXSpace direction='vertical'>
          <JXSpace align='center' gap={8}>
            <DotLoading />
            <Text>{progressText}</Text>
          </JXSpace>
          <Text>当前：{genState.name || '准备中'}</Text>
        </JXSpace>
      </JXModal>
    </View>
  );
}
export default Index;
