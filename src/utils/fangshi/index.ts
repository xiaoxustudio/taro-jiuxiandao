import { random } from 'lodash-es';
import { CWType, FabaoPinjie } from '@/types';
import {
  FANGSHI_CONFIG,
  clGrades,
  clGradePrice,
  createSeedRegistry,
  flattenMaterialPool,
  MaterialPoolByGrade,
  SeedRegistryItem,
  dfGrades,
  REALM_ORDER,
  REALM_GRADE_WEIGHTS,
  PJ_BY_REALM,
  FANGSHI_REFRESH_INTERVAL
} from '@/assets/const';
import { pickWeightedIndex } from '@/utils';
import {
  createFaBaoList,
  createDanYaoList,
  createRandomDanYaoList,
  shuffle,
  FangshiItem,
  FangshiSnapshot
} from './generator';

export * from './generator';
export { FANGSHI_REFRESH_INTERVAL } from '@/assets/const';

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
