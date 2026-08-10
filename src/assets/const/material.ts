export const clNameParts = [
  ['灵', '玄', '玉', '雪', '苍', '赤', '紫', '青', '黑', '金', '霜', '炎'],
  ['心', '魄', '魂', '元', '神', '华', '纹', '影', '痕', '息', '骨', '髓'],
  ['草', '花', '藤', '木', '液', '砂', '石', '晶', '萃', '页', '露', '芽']
] as const;
export const clGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;
export const clGradePrice: Record<(typeof clGrades)[number], [number, number]> =
  {
    一品: [6, 30],
    二品: [50, 200],
    三品: [300, 1200],
    四品: [2000, 6000],
    五品: [8000, 20000],
    六品: [16000, 40000],
    七品: [32000, 80000],
    八品: [64000, 160000]
  };

export const MATERIAL_INIT_COUNT = 1000;
export const ACTOR_POOL_CONFIG = {
  countPerGrade: 20,
  gongfaCountPerGrade: 30
};

export type MaterialRegistryItem = {
  name: string;
  itype: (typeof clGrades)[number];
};

export type SeedRegistryItem = {
  name: string;
  material: string;
  itype: (typeof clGrades)[number];
  time: [number, number, number];
};

export type MaterialPoolByGrade = Record<
  (typeof clGrades)[number],
  MaterialRegistryItem[]
>;

export const SEED_GROW_TIME_BY_GRADE: Record<
  (typeof clGrades)[number],
  [number, number, number]
> = {
  一品: [0, 0, 5],
  二品: [0, 0, 10],
  三品: [0, 0, 20],
  四品: [0, 1, 0],
  五品: [0, 2, 0],
  六品: [0, 4, 0],
  七品: [0, 8, 0],
  八品: [1, 0, 0]
};
export const MATERIAL_BASE_LIST: MaterialRegistryItem[] = [
  { name: '洗骨花', itype: '一品' },
  { name: '千叶草', itype: '一品' },
  { name: '玫瑰花', itype: '一品' },
  { name: '妖丹', itype: '一品' },
  { name: '魔晶', itype: '一品' },
  { name: '草灵', itype: '一品' },
  { name: '铁线藤', itype: '一品' },
  { name: '凝血花', itype: '一品' },
  { name: '聚气草', itype: '一品' },
  { name: '百年茯苓', itype: '一品' },
  { name: '百灵血竹', itype: '二品' },
  { name: '彳果', itype: '二品' },
  { name: '柔水', itype: '二品' },
  { name: '寒髓液', itype: '二品' },
  { name: '赤铜精', itype: '二品' },
  { name: '青魂木', itype: '二品' },
  { name: '碎星铁', itype: '二品' },
  { name: '玉蜂浆', itype: '二品' },
  { name: '万灵草', itype: '三品' },
  { name: '枯木灵藤', itype: '三品' },
  { name: '木之精华', itype: '三品' },
  { name: '地髓液', itype: '三品' },
  { name: '紫铜母', itype: '三品' },
  { name: '火灵砂', itype: '三品' },
  { name: '升灵石', itype: '四品' },
  { name: '灵玉液', itype: '四品' },
  { name: '水华', itype: '四品' },
  { name: '碧落石', itype: '四品' },
  { name: '凝霜玉', itype: '四品' },
  { name: '地母精', itype: '四品' },
  { name: '玄纹髓', itype: '五品' },
  { name: '凤凰翎', itype: '五品' },
  { name: '麒麟角', itype: '五品' },
  { name: '天罡砂', itype: '五品' },
  { name: '太乙精金', itype: '五品' },
  { name: '青冥玉', itype: '五品' },
  { name: '霜魄晶', itype: '六品' },
  { name: '万年温玉', itype: '六品' },
  { name: '九天玄铁', itype: '六品' },
  { name: '星河沙', itype: '六品' },
  { name: '凤血石', itype: '六品' },
  { name: '幽炎砂', itype: '七品' },
  { name: '星辰砂', itype: '七品' },
  { name: '混沌之气', itype: '七品' },
  { name: '太虚神铁', itype: '七品' },
  { name: '残·龙魂', itype: '八品' },
  { name: '鸿蒙紫气', itype: '八品' },
  { name: '天道碎片', itype: '八品' },
  { name: '创世元灵', itype: '八品' }
];
export const MATERIAL_GRADE_COUNTS: Record<(typeof clGrades)[number], number> =
  {
    一品: 10,
    二品: 10,
    三品: 8,
    四品: 8,
    五品: 8,
    六品: 6,
    七品: 6,
    八品: 5
  };
const UINT32_MAX = 4294967296;
const seedToNumber = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h = (Math.imul(h, 16777619) + seed.charCodeAt(i)) % UINT32_MAX;
  }
  return h;
};
export const createRng = (seed?: string) => {
  if (!seed) return Math.random;
  let state = seedToNumber(seed);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) % UINT32_MAX;
    return state / UINT32_MAX;
  };
};

const uniqueNameSuffixPool = [
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

const appendUniqueSuffix = (
  baseName: string,
  used: Set<string>,
  rng: () => number
) => {
  let candidate = baseName;
  let guard = 0;
  while (used.has(candidate) && guard < 16) {
    const suffix =
      uniqueNameSuffixPool[Math.floor(rng() * uniqueNameSuffixPool.length)] ??
      uniqueNameSuffixPool[0];
    candidate = `${baseName}${suffix}`;
    guard += 1;
  }
  if (!used.has(candidate)) return candidate;
  let candidate2 = candidate;
  let guard2 = 0;
  while (used.has(candidate2) && guard2 < 24) {
    const s1 =
      uniqueNameSuffixPool[Math.floor(rng() * uniqueNameSuffixPool.length)] ??
      uniqueNameSuffixPool[0];
    const s2 =
      uniqueNameSuffixPool[Math.floor(rng() * uniqueNameSuffixPool.length)] ??
      uniqueNameSuffixPool[0];
    candidate2 = `${baseName}${s1}${s2}`;
    guard2 += 1;
  }
  return candidate2;
};

export const createMaterialRegistry = (options?: {
  seed?: string;
  counts?: Partial<Record<(typeof clGrades)[number], number>>;
}) => {
  const rng = createRng(options?.seed);
  const counts = { ...MATERIAL_GRADE_COUNTS, ...(options?.counts ?? {}) };
  const used = new Set<string>(MATERIAL_BASE_LIST.map((item) => item.name));
  const list: MaterialRegistryItem[] = [...MATERIAL_BASE_LIST];
  clGrades.forEach((grade) => {
    const target = counts[grade] ?? 0;
    const current = list.filter((item) => item.itype === grade).length;
    const need = Math.max(0, target - current);
    for (let i = 0; i < need; i += 1) {
      let name = clNameParts
        .map((part) => part[Math.floor(rng() * part.length)])
        .join('');
      let guard = 0;
      while (used.has(name) && guard < 5) {
        name = clNameParts
          .map((part) => part[Math.floor(rng() * part.length)])
          .join('');
        guard += 1;
      }
      if (used.has(name)) {
        name = appendUniqueSuffix(name, used, rng);
      }
      used.add(name);
      list.push({ name, itype: grade });
    }
  });
  return list;
};
export const createSeedRegistry = (materials: MaterialRegistryItem[]) => {
  return materials.map((item) => ({
    name: `${item.name}种子`,
    material: item.name,
    itype: item.itype,
    time: SEED_GROW_TIME_BY_GRADE[item.itype] ?? [0, 0, 5]
  }));
};
export const flattenMaterialPool = (pool?: MaterialPoolByGrade) => {
  if (!pool) return [];
  return clGrades.flatMap((grade) => pool[grade] ?? []);
};
