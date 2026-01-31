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
  clGrades,
  clGradePrice,
  createSeedRegistry,
  flattenMaterialPool,
  MaterialPoolByGrade,
  SeedRegistryItem,
  danfangIds,
  dfGrades,
  dyNameParts,
  dyGrades,
  dyGradeMultipliers,
  dyRarityLevels,
  dyRarityMultipliers,
  DY_EFFECT_SCALE,
  REALM_ORDER,
  REALM_GRADE_WEIGHTS,
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
  material?: string;
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
function shuffle<T>(list: T[]) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

/**
 * @description: 基于丹方配置生成固定丹药列表
 * @return {*}
 */
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

/**
 * @description: 坊市分类配置（用于 UI tab 与购买逻辑）
 * @return {*}
 */
export const fangshiCategories = [
  { key: 'fb', label: '法宝', action: 'item' },
  { key: 'dy', label: '丹药', action: 'item' },
  { key: 'cl', label: '材料', action: 'item' },
  {
    key: 'df',
    label: '丹方',
    action: 'danfang'
  }
] as const;

/**
 * @description: 获取境界在 REALM_ORDER 中的索引（找不到返回 0）
 * @param {string} realm
 * @return {*}
 */
export const getRealmIndex = (realm: string) => {
  const idx = REALM_ORDER.indexOf(realm);
  return idx === -1 ? 0 : idx;
};

const pickWeightedIndex = (weights: number[]) => {
  const sumW = weights.reduce((a, b) => a + b, 0) || 1;
  const rPick = random(1, sumW);
  let acc = 0;
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i];
    if (rPick <= acc) return i;
  }
  return 0;
};

const pickMaterialsFromPoolByGrade = (
  realm: string,
  count: number,
  pool: MaterialPoolByGrade,
  seedRegistry?: SeedRegistryItem[]
): FangshiItem[] => {
  const weights =
    REALM_GRADE_WEIGHTS[realm as keyof typeof REALM_GRADE_WEIGHTS] ||
    REALM_GRADE_WEIGHTS['练气'];
  const used = new Set<string>();
  const list: FangshiItem[] = [];
  const seedRegistryResolved = seedRegistry?.length
    ? seedRegistry
    : createSeedRegistry(flattenMaterialPool(pool));
  const seedByGrade = clGrades.reduce(
    (acc, grade) => {
      acc[grade] = seedRegistryResolved.filter((item) => item.itype === grade);
      return acc;
    },
    {} as Record<(typeof clGrades)[number], SeedRegistryItem[]>
  );
  let guard = 0;
  while (list.length < count && guard < count * 30) {
    const gradeIndex = pickWeightedIndex(weights);
    const grade = clGrades[gradeIndex] || clGrades[0];
    const candidates = pool[grade] ?? [];
    const seedCandidates = seedByGrade[grade] ?? [];
    const shouldPickSeed = seedCandidates.length > 0 && Math.random() < 0.25;
    let picked = false;
    if (shouldPickSeed) {
      const pickedSeed = seedCandidates[random(0, seedCandidates.length - 1)];
      if (pickedSeed?.name && !used.has(pickedSeed.name)) {
        used.add(pickedSeed.name);
        const [minP, maxP] = clGradePrice[grade];
        list.push({
          name: pickedSeed.name,
          material: pickedSeed.material,
          desc: '种子，用于药园种植',
          itype: grade,
          time: pickedSeed.time,
          ls: Math.round(random(minP, maxP) * 1.2),
          type: CWType.QT,
          isPile: true
        });
        picked = true;
      } else {
        guard += 1;
      }
    }
    if (!picked && candidates.length) {
      const pickedMaterial = candidates[random(0, candidates.length - 1)];
      if (pickedMaterial?.name && !used.has(pickedMaterial.name)) {
        used.add(pickedMaterial.name);
        const [minP, maxP] = clGradePrice[grade];
        list.push({
          name: pickedMaterial.name,
          desc: '材料，用于炼制丹药',
          itype: grade,
          ls: random(minP, maxP),
          type: CWType.QT,
          isPile: true
        });
      } else {
        guard += 1;
      }
    } else if (!picked) {
      guard += 1;
    }
  }
  return list;
};

const pickDanFangFromPoolByGrade = (
  realm: string,
  count: number,
  pool: Record<string, FangshiItem[]>
): FangshiItem[] => {
  const weights =
    REALM_GRADE_WEIGHTS[realm as keyof typeof REALM_GRADE_WEIGHTS] ||
    REALM_GRADE_WEIGHTS['练气'];
  const used = new Set<string>();
  const list: FangshiItem[] = [];
  let guard = 0;
  while (list.length < count && guard < count * 30) {
    const gradeIndex = pickWeightedIndex(weights);
    const grade = dfGrades[gradeIndex] || dfGrades[0];
    const candidates = pool[grade] ?? [];
    if (candidates.length) {
      const picked = candidates[random(0, candidates.length - 1)];
      const key = picked?.id || picked?.name;
      if (key && !used.has(key)) {
        used.add(key);
        list.push(picked);
      } else {
        guard += 1;
      }
    } else {
      guard += 1;
    }
  }
  return list;
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

/**
 * @description: 生成坊市快照（按境界与材料/丹方池生成商品）
 * @param {string} realm
 * @param {number} updatedAt
 * @param {*} materialPoolByGrade
 * @param {*} danfangPoolByGrade
 * @return {*}
 */
export const createFangshiSnapshot = (
  realm: string,
  updatedAt?: number,
  materialPoolByGrade?: MaterialPoolByGrade,
  danfangPoolByGrade?: Record<string, FangshiItem[]>,
  seedRegistry?: SeedRegistryItem[]
): FangshiSnapshot => {
  const ts = updatedAt ?? Date.now();
  const realmIndex = getRealmIndex(realm);
  const fbList = createFaBaoList();
  const dyList = [
    ...createDanYaoList(),
    ...createRandomDanYaoList(FANGSHI_CONFIG.randDyCount, realmIndex)
  ];
  const clItems = materialPoolByGrade
    ? pickMaterialsFromPoolByGrade(
        realm,
        FANGSHI_CONFIG.clBaseCount + realmIndex,
        materialPoolByGrade,
        seedRegistry
      )
    : [];
  const dfItems = danfangPoolByGrade
    ? pickDanFangFromPoolByGrade(
        realm,
        FANGSHI_CONFIG.dfBaseCount + realmIndex,
        danfangPoolByGrade
      )
    : [];
  return {
    updatedAt: ts,
    realm,
    items: {
      fb: pickFaBaoByRealm(fbList, realmIndex, FANGSHI_CONFIG.fbBaseCount),
      dy: pickByRealm(dyList, realmIndex, FANGSHI_CONFIG.dyBaseCount),
      cl: clItems,
      df: dfItems
    }
  };
};

/**
 * @description: 解析/刷新坊市快照（未过期则复用，否则重新生成）
 * @param {*} snapshot
 * @param {string} realm
 * @param {number} now
 * @param {*} materialPoolByGrade
 * @param {*} danfangPoolByGrade
 * @return {*}
 */
export const resolveFangshiSnapshot = (
  snapshot: FangshiSnapshot | null | undefined,
  realm: string,
  now?: number,
  materialPoolByGrade?: MaterialPoolByGrade,
  danfangPoolByGrade?: Record<string, FangshiItem[]>,
  seedRegistry?: SeedRegistryItem[]
) => {
  const ts = now ?? Date.now();
  if (
    snapshot &&
    snapshot.realm === realm &&
    ts - snapshot.updatedAt < FANGSHI_REFRESH_INTERVAL
  ) {
    return snapshot;
  }
  return createFangshiSnapshot(
    realm,
    ts,
    materialPoolByGrade,
    danfangPoolByGrade,
    seedRegistry
  );
};
