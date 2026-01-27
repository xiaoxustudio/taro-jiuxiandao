import { random } from 'lodash-es';
import danfangData from '@/assets/danfang.json';
import { CWType, FabaoPinjie } from '@/types';
import {
  faBaoTierConfig,
  faBaoTypeConfig,
  faBaoLocationPool,
  mainAttrMultiplier,
  extraAttrMultiplier,
  FANGSHI_CONFIG,
  caiLiaoBaseList,
  clNameParts,
  clGrades,
  clGradePrice,
  danfangIds,
  dfGrades,
  dyNameParts,
  dyGrades,
  dyGradeMultipliers,
  dyRarityLevels,
  dyRarityMultipliers,
  DY_EFFECT_SCALE,
  REALM_ORDER,
  PJ_BY_REALM,
  FANGSHI_REFRESH_INTERVAL
} from '@/assets/const';

export { FANGSHI_REFRESH_INTERVAL } from '@/assets/const';

export type FangshiCategoryKey = 'fb' | 'dy' | 'cl' | 'df';

export type FangshiItem = {
  name: string;
  type: CWType | number;
  isPile?: boolean;
  desc?: string;
  itype?: string;
  ls: number;
  baseLs?: number;
  attr?: Record<string, number>;
  lv?: number;
  pj?: string;
  id?: string;
  cl?: [string, number][];
  time?: number[];
};

export type FangshiSnapshot = {
  updatedAt: number;
  realm: string;
  items: Record<FangshiCategoryKey, FangshiItem[]>;
};

type FaBaoBaseItem = Omit<FangshiItem, 'type' | 'lv' | 'isPile'>;

const pick = <T>(list: T[]) => list[random(0, list.length - 1)];
const buildName = (parts: string[][]) => parts.map(pick).join('');

const createFaBaoBaseList = (): FaBaoBaseItem[] => {
  const list: FaBaoBaseItem[] = [];
  const usedNames = new Set<string>();
  const tierCounts = FANGSHI_CONFIG.fbTierCounts;
  faBaoTierConfig.forEach((tier) => {
    faBaoTypeConfig.forEach((type) => {
      const count = tierCounts[tier.pj] ?? 1;
      for (let i = 0; i < count; i += 1) {
        let name = buildName(type.parts);
        let guard = 0;
        while (usedNames.has(name) && guard < 5) {
          name = buildName(type.parts);
          guard += 1;
        }
        if (usedNames.has(name)) {
          name = `${name}${random(1, 99)}`;
        }
        usedNames.add(name);
        const mainBase = random(tier.attrRange[0], tier.attrRange[1]);
        const mainValue = Math.round(
          mainBase * (mainAttrMultiplier[type.mainAttr] ?? 1)
        );
        const negMain =
          Math.random() < FANGSHI_CONFIG.negChanceMain
            ? -Math.max(
                1,
                Math.round(
                  mainValue *
                    (FANGSHI_CONFIG.negScaleMin +
                      Math.random() *
                        (FANGSHI_CONFIG.negScaleMax -
                          FANGSHI_CONFIG.negScaleMin))
                )
              )
            : mainValue;
        const attrs: Record<string, number> = { [type.mainAttr]: negMain };
        if (type.extraAttrs.length) {
          const extraKey = pick(type.extraAttrs);
          if (extraKey === 'baoji') {
            const maxB = Math.max(2, Math.round(tier.extraRange[1] / 20)) || 2;
            const bVal = random(1, maxB);
            attrs.baoji =
              Math.random() < FANGSHI_CONFIG.baojiNegChance
                ? -random(1, Math.max(1, Math.floor(maxB / 2)))
                : bVal;
          } else {
            const extraBase = random(tier.extraRange[0], tier.extraRange[1]);
            const exVal = Math.round(
              extraBase * (extraAttrMultiplier[extraKey] ?? 1)
            );
            const negExtra =
              Math.random() < FANGSHI_CONFIG.negChanceExtra
                ? -Math.max(
                    1,
                    Math.round(
                      exVal *
                        (FANGSHI_CONFIG.negScaleMin +
                          Math.random() *
                            (FANGSHI_CONFIG.negScaleMax -
                              FANGSHI_CONFIG.negScaleMin))
                    )
                  )
                : exVal;
            attrs[extraKey] = negExtra;
          }
        }
        list.push({
          name,
          attr: attrs,
          pj: tier.pj,
          itype: type.itype,
          desc: `${pick(faBaoLocationPool)}·${buildName(tier.descParts)}炼制`,
          ls: random(tier.lsRange[0], tier.lsRange[1])
        });
      }
    });
  });
  return list;
};

const createFaBaoList = (): FangshiItem[] =>
  createFaBaoBaseList().map((item) => ({
    ...item,
    type: CWType.FB,
    lv: 0,
    isPile: false
  }));

type CaiLiaoBaseItem = Omit<FangshiItem, 'type' | 'isPile'>;
const createCaiLiaoList = (): FangshiItem[] =>
  (caiLiaoBaseList as CaiLiaoBaseItem[]).map((item) => ({
    ...item,
    type: CWType.QT,
    isPile: true
  }));

const createRandomCaiLiaoList = (count: number): FangshiItem[] => {
  const list: FangshiItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i += 1) {
    let name = buildName(clNameParts as unknown as string[][]);
    let guard = 0;
    while (used.has(name) && guard < 5) {
      name = buildName(clNameParts as unknown as string[][]);
      guard += 1;
    }
    if (used.has(name)) {
      name = `${name}${random(1, 99)}`;
    }
    used.add(name);
    const grade = clGrades[random(0, clGrades.length - 1)];
    const [minP, maxP] = clGradePrice[grade];
    list.push({
      name,
      desc: '材料，用于炼制丹药',
      itype: grade,
      ls: random(minP, maxP),
      type: CWType.QT,
      isPile: true
    });
  }
  return list;
};

export const createDanYaoList = (): FangshiItem[] =>
  danfangIds.map((id) => {
    const base = danfangData[id] as any;
    const cl = (base?.cl ?? []) as [string, number][];
    const time = (base?.time ?? []) as number[];
    return {
      ...base,
      cl,
      time,
      type: CWType.DY,
      ls: Math.round(base.ls * FANGSHI_CONFIG.dyPriceScale)
    };
  });

const pickRarity = (p: number) => {
  if (p < 0.5) return dyRarityLevels[0];
  if (p < 0.75) return dyRarityLevels[1];
  if (p < 0.9) return dyRarityLevels[2];
  if (p < 0.97) return dyRarityLevels[3];
  return dyRarityLevels[4];
};

const createRandomDanYaoList = (
  count: number,
  realmIndex: number
): FangshiItem[] => {
  const list: FangshiItem[] = [];
  const used = new Set<string>();
  const maxGradeIndex = Math.min(dyGrades.length - 1, realmIndex);
  const allowedGrades = dyGrades.slice(0, maxGradeIndex + 1);
  for (let i = 0; i < count; i += 1) {
    let name = buildName(dyNameParts as unknown as string[][]);
    let guard = 0;
    while (used.has(name) && guard < 5) {
      name = buildName(dyNameParts as unknown as string[][]);
      guard += 1;
    }
    if (used.has(name)) {
      name = `${name}${random(1, 99)}`;
    }
    used.add(name);
    const grade = allowedGrades[random(0, allowedGrades.length - 1)];
    const isShen = Math.random() < 0.5;
    const scale = DY_EFFECT_SCALE[grade];
    const valRange = isShen ? scale.shenshi : scale.xiuwei;
    const baseVal = random(valRange[0], valRange[1]);
    const attr: Record<string, number> = isShen
      ? { shenshi: baseVal }
      : { xiuwei: baseVal };
    const priceRange = scale.price;
    const t =
      valRange[1] === valRange[0]
        ? 0
        : (baseVal - valRange[0]) / (valRange[1] - valRange[0]);
    const priceBase = Math.round(
      priceRange[0] + t * (priceRange[1] - priceRange[0])
    );
    const rarity = pickRarity(Math.random());
    const gradeMul = dyGradeMultipliers[grade];
    const rarityMul = dyRarityMultipliers[rarity];
    list.push({
      name,
      type: CWType.DY,
      isPile: true,
      itype: grade,
      desc: isShen ? '恢复神识的丹药' : '增加修为的丹药',
      attr,
      ls: Math.round(
        priceBase * gradeMul * rarityMul * FANGSHI_CONFIG.dyPriceScale
      )
    });
  }
  return list;
};

const buildRandomDanfangId = (seed: string, index: number) =>
  `r${seed}${index}${random(1000, 9999)}`;
const getGradeIndex = (
  grade: string | undefined,
  grades: readonly string[]
) => {
  const idx = grades.indexOf(grade ?? '');
  return idx === -1 ? 0 : idx;
};

const createRandomDanFangList = (
  count: number,
  realmIndex: number,
  materialPool: FangshiItem[]
): FangshiItem[] => {
  const list: FangshiItem[] = [];
  const used = new Set<string>();
  const usageCounts = new Map<string, number>();
  const materialPoolMap = new Map<string, FangshiItem>();
  materialPool.forEach((item) => {
    if (item?.name && !materialPoolMap.has(item.name)) {
      materialPoolMap.set(item.name, item);
    }
  });
  const normalizedPool = [...materialPoolMap.values()];
  const maxGradeIndex = Math.min(dfGrades.length - 1, realmIndex);
  const allowedGrades = dfGrades.slice(0, maxGradeIndex + 1);
  const seed = Date.now().toString(36);
  for (let i = 0; i < count; i += 1) {
    let name = buildName(dyNameParts as unknown as string[][]);
    let guard = 0;
    while (used.has(name) && guard < 5) {
      name = buildName(dyNameParts as unknown as string[][]);
      guard += 1;
    }
    if (used.has(name)) {
      name = `${name}${random(1, 99)}`;
    }
    used.add(name);
    const grade = allowedGrades[random(0, allowedGrades.length - 1)];
    const gradeIndex = getGradeIndex(grade, dfGrades);
    const isShen = Math.random() < 0.5;
    const scale = DY_EFFECT_SCALE[grade];
    const valRange = isShen ? scale.shenshi : scale.xiuwei;
    const baseVal = random(valRange[0], valRange[1]);
    const attr: Record<string, number> = isShen
      ? { shenshi: baseVal }
      : { xiuwei: baseVal };
    const priceRange = scale.price;
    const t =
      valRange[1] === valRange[0]
        ? 0
        : (baseVal - valRange[0]) / (valRange[1] - valRange[0]);
    const priceBase = Math.round(
      priceRange[0] + t * (priceRange[1] - priceRange[0])
    );
    const rarity = pickRarity(Math.random());
    const gradeMul = dyGradeMultipliers[grade];
    const rarityMul = dyRarityMultipliers[rarity];
    const baseLs = Math.round(priceBase * gradeMul * rarityMul);
    const filteredPool = normalizedPool.filter(
      (item) => getGradeIndex(item.itype, clGrades) <= gradeIndex && item.name
    );
    const pool = filteredPool.length ? filteredPool : normalizedPool;
    const pickCount = Math.min(
      pool.length,
      Math.max(2, 2 + Math.floor(gradeIndex / 2) + random(0, 1))
    );
    const picked: FangshiItem[] = [];
    const mutablePool = [...pool];
    for (let j = 0; j < pickCount && mutablePool.length; j += 1) {
      let minUsage = Infinity;
      mutablePool.forEach((item) => {
        const usedCount = usageCounts.get(item.name) ?? 0;
        if (usedCount < minUsage) {
          minUsage = usedCount;
        }
      });
      const candidates = mutablePool.filter(
        (item) => (usageCounts.get(item.name) ?? 0) <= minUsage + 1
      );
      const targetPool = candidates.length ? candidates : mutablePool;
      const idx = random(0, targetPool.length - 1);
      const pickedItem = targetPool[idx];
      const removeIndex = mutablePool.findIndex(
        (item) => item.name === pickedItem.name
      );
      if (removeIndex >= 0) {
        mutablePool.splice(removeIndex, 1);
      }
      picked.push(pickedItem);
      usageCounts.set(
        pickedItem.name,
        (usageCounts.get(pickedItem.name) ?? 0) + 1
      );
    }
    const cl = picked.map((item): [string, number] => {
      const clGradeIndex = getGradeIndex(item.itype, clGrades);
      const minNum = 1 + Math.max(0, gradeIndex - clGradeIndex);
      const maxNum = 3 + gradeIndex + Math.max(0, gradeIndex - clGradeIndex);
      const baseNum = random(minNum, maxNum);
      const numScale = 0.85 + Math.random() * 0.5;
      return [item.name, Math.max(1, Math.round(baseNum * numScale))];
    });
    const time = [
      Math.max(0, Math.floor(gradeIndex / 3)),
      Math.min(12, gradeIndex * 2),
      random(5, 15 + gradeIndex * 3)
    ];
    const id = buildRandomDanfangId(seed, i);
    list.push({
      id,
      name: `${name}丹方`,
      type: 5,
      isPile: true,
      itype: grade,
      desc: isShen ? '恢复神识的丹药' : '增加修为的丹药',
      attr,
      cl,
      time,
      baseLs,
      ls: Math.round(baseLs * FANGSHI_CONFIG.dfPriceScale)
    });
  }
  return list;
};

export const createDanFangList = (realmIndex?: number): FangshiItem[] => {
  const list = danfangIds.map((id) => {
    const base = danfangData[id] as any;
    const cl = (base?.cl ?? []) as [string, number][];
    const time = (base?.time ?? []) as number[];
    return {
      ...base,
      cl,
      time,
      name: `${base.name}丹方`,
      id,
      baseLs: base.ls,
      ls: Math.round(base.ls * FANGSHI_CONFIG.dfPriceScale)
    };
  });
  if (realmIndex === undefined) return list;
  const maxGradeIndex = Math.min(dfGrades.length - 1, Math.max(0, realmIndex));
  return list.filter((item) => {
    const idx = dfGrades.indexOf(item.itype as (typeof dfGrades)[number]);
    return idx !== -1 && idx <= maxGradeIndex;
  });
};

export const fangshiCategories = [
  { key: 'fb', label: '法宝', action: 'item', list: () => createFaBaoList() },
  { key: 'dy', label: '丹药', action: 'item', list: () => createDanYaoList() },
  { key: 'cl', label: '材料', action: 'item', list: () => createCaiLiaoList() },
  {
    key: 'df',
    label: '丹方',
    action: 'danfang',
    list: () => createDanFangList()
  }
] as const;

export const getRealmIndex = (realm: string) => {
  const idx = REALM_ORDER.indexOf(realm);
  return idx === -1 ? 0 : idx;
};

const shuffle = <T>(list: T[]) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickByRealm = <T extends { ls: number }>(
  list: T[],
  realmIndex: number,
  baseCount: number
) => {
  if (!list.length) return [];
  const sorted = [...list].sort((a, b) => a.ls - b.ls);
  const realmRate = (realmIndex + 1) / REALM_ORDER.length;
  const desiredCount = Math.min(sorted.length, baseCount + realmIndex);
  const poolSize = Math.max(desiredCount, Math.ceil(sorted.length * realmRate));
  const pool = sorted.slice(0, Math.min(sorted.length, poolSize));
  return shuffle(pool).slice(0, desiredCount);
};

const pickFaBaoByRealm = (
  list: FangshiItem[],
  realmIndex: number,
  baseCount: number
) => {
  const allowed = new Set(PJ_BY_REALM.slice(0, realmIndex + 1));
  const filtered = list.filter((i) => i.pj && allowed.has(i.pj as FabaoPinjie));
  if (!filtered.length) return [];
  const sorted = [...filtered].sort((a, b) => a.ls - b.ls);
  const count = Math.min(sorted.length, baseCount + realmIndex);
  return shuffle(sorted).slice(0, count);
};

export const createFangshiSnapshot = (
  realm: string,
  updatedAt = Date.now()
): FangshiSnapshot => {
  const realmIndex = getRealmIndex(realm);
  const fbList = createFaBaoList();
  const dyList = [
    ...createDanYaoList(),
    ...createRandomDanYaoList(FANGSHI_CONFIG.randDyCount, realmIndex)
  ];
  const randomClList = createRandomCaiLiaoList(FANGSHI_CONFIG.randClCount);
  const clList = [...createCaiLiaoList(), ...randomClList];
  const dfList = [
    ...createDanFangList(realmIndex),
    ...createRandomDanFangList(FANGSHI_CONFIG.randDfCount, realmIndex, clList)
  ];
  return {
    updatedAt,
    realm,
    items: {
      fb: pickFaBaoByRealm(fbList, realmIndex, FANGSHI_CONFIG.fbBaseCount),
      dy: pickByRealm(dyList, realmIndex, FANGSHI_CONFIG.dyBaseCount),
      cl: pickByRealm(clList, realmIndex, FANGSHI_CONFIG.clBaseCount),
      df: pickByRealm(dfList, realmIndex, FANGSHI_CONFIG.dfBaseCount)
    }
  };
};

export const resolveFangshiSnapshot = (
  snapshot: FangshiSnapshot | null | undefined,
  realm: string,
  now = Date.now()
) => {
  if (
    snapshot &&
    snapshot.realm === realm &&
    now - snapshot.updatedAt < FANGSHI_REFRESH_INTERVAL
  ) {
    return snapshot;
  }
  return createFangshiSnapshot(realm, now);
};
