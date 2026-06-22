import { FabaoPinjie } from '@/types';

// ------------------------------
// 法宝配置
// ------------------------------
export const faBaoTierConfig = [
  {
    pj: '法器',
    lsRange: [600, 3000],
    attrRange: [3, 18],
    extraRange: [1, 6],
    descParts: [
      ['古', '玄', '天', '灵', '太', '云', '星', '幽'],
      ['法', '器', '阵', '剑', '霄', '玄', '御'],
      ['门', '宗', '宫', '府', '殿', '阁', '坊']
    ]
  },
  {
    pj: '灵器',
    lsRange: [2500, 9000],
    attrRange: [8, 40],
    extraRange: [3, 12],
    descParts: [
      ['星', '紫', '青', '玄', '霜', '渊', '苍', '灵'],
      ['痕', '影', '冥', '辰', '岳', '炎', '霄'],
      ['尊者', '真人', '宗师', '长老', '散人']
    ]
  },
  {
    pj: '法宝',
    lsRange: [8000, 25000],
    attrRange: [15, 70],
    extraRange: [5, 18],
    descParts: [
      ['灵', '玄', '太', '紫', '青', '赤', '云', '傲'],
      ['霄', '辰', '云', '焰', '羽', '星', '冥'],
      ['殿主', '宫主', '阁主', '堂主', '坊主']
    ]
  },
  {
    pj: '古宝',
    lsRange: [15000, 50000],
    attrRange: [25, 110],
    extraRange: [8, 26],
    descParts: [
      ['上古', '远古', '洪荒', '太古', '中古', '史前'],
      ['玄', '神', '荒', '冥', '元', '渊'],
      ['尊者', '仙师', '真君', '上人', '天师']
    ]
  },
  {
    pj: '灵宝',
    lsRange: [35000, 110000],
    attrRange: [40, 160],
    extraRange: [12, 36],
    descParts: [
      ['太', '玄', '天', '幽', '无', '九', '凌'],
      ['灵', '元', '极', '辰', '霄', '冥', '曜'],
      ['道君', '真君', '仙尊', '天尊', '圣使']
    ]
  },
  {
    pj: '后天灵宝',
    lsRange: [90000, 240000],
    attrRange: [70, 260],
    extraRange: [18, 50],
    descParts: [
      ['后天', '幻天', '离火', '坤元', '混元', '琅玕'],
      ['玄', '灵', '煞', '曜', '霆', '溟'],
      ['上尊', '地君', '天君', '法王', '圣主']
    ]
  },
  {
    pj: '先天灵宝',
    lsRange: [200000, 520000],
    attrRange: [110, 380],
    extraRange: [24, 70],
    descParts: [
      ['先天', '太初', '无上', '元始', '太一', '混沌'],
      ['玄', '灵', '极', '曜', '霄', '冥'],
      ['道尊', '天帝', '神主', '圣皇', '祖师']
    ]
  },
  {
    pj: '通天灵宝',
    lsRange: [520000, 1400000],
    attrRange: [160, 600],
    extraRange: [30, 90],
    descParts: [
      ['太', '玄', '天', '幽', '无', '九', '太上'],
      ['虚', '元', '极', '辰', '霄', '冥', '寂'],
      ['老祖', '圣主', '天君', '道尊', '祖师']
    ]
  }
];

export const faBaoTypeConfig = [
  {
    itype: '手持武器',
    parts: [
      ['赤', '青', '玄', '紫', '金', '白', '幽', '凌'],
      ['云', '影', '灵', '霄', '星', '霜', '阳', '月'],
      ['剑', '枪', '戟', '刃']
    ],
    mainAttr: 'gongji',
    extraAttrs: ['baoji', 'fangyu']
  },
  {
    itype: '头戴战盔',
    parts: [
      ['白', '赤', '蓝', '紫', '青', '金', '玄'],
      ['鹿', '玉', '云', '月', '魄', '辰'],
      ['冠', '盔', '巾']
    ],
    mainAttr: 'fangyu',
    extraAttrs: ['qixue']
  },
  {
    itype: '身穿战甲',
    parts: [
      ['青', '玄', '紫', '赤', '金', '白'],
      ['云', '霜', '影', '灵', '岚'],
      ['袍', '甲', '衣']
    ],
    mainAttr: 'qixue',
    extraAttrs: ['fangyu']
  },
  {
    itype: '腰带护具',
    parts: [
      ['蓝', '赤', '玄', '紫', '青', '金'],
      ['玉', '星', '云', '影', '灵'],
      ['腰带', '束', '佩']
    ],
    mainAttr: 'fangyu',
    extraAttrs: ['qixue']
  },
  {
    itype: '饰品加持',
    parts: [
      ['白', '玄', '紫', '金', '青'],
      ['玉', '灵', '月', '星', '影'],
      ['戒', '链', '佩', '环']
    ],
    mainAttr: 'qixue',
    extraAttrs: ['gongji']
  },
  {
    itype: '鞋子护腿',
    parts: [
      ['流', '踏', '御', '凌', '逐', '飞'],
      ['云', '风', '月', '霜', '影'],
      ['履', '靴', '鞋']
    ],
    mainAttr: 'sudu',
    extraAttrs: ['fangyu']
  },
  {
    itype: '魂器镇魂',
    parts: [
      ['镇', '锁', '缚', '封', '摄', '定'],
      ['魂', '灵', '魄', '神', '念', '识'],
      ['印', '塔', '珠', '镜', '钟', '环']
    ],
    mainAttr: 'fangyu',
    extraAttrs: ['xianyuan', 'baoji']
  },
  {
    itype: '本名法宝',
    parts: [
      ['本命', '道', '玄', '元', '真', '天'],
      ['灵', '神', '元', '道', '法', '心'],
      ['剑', '鼎', '印', '镜', '珠', '塔']
    ],
    mainAttr: 'gongji',
    extraAttrs: ['qixue', 'sudu', 'baoji']
  }
];

// ------------------------------
// 法宝地点与属性权重
// ------------------------------
export const faBaoLocationPool = [
  '北境雪原',
  '东海遗迹',
  '南岭幽谷',
  '西荒古城',
  '云梦泽',
  '天阙峰',
  '紫霄宫',
  '星陨台',
  '玄木林',
  '赤炎谷'
];

export const mainAttrMultiplier: Record<string, number> = {
  gongji: 2.2,
  qixue: 1.6,
  fangyu: 1.2,
  sudu: 1
};
export const extraAttrMultiplier: Record<string, number> = {
  gongji: 1.4,
  qixue: 1.1,
  fangyu: 0.9,
  sudu: 0.8
};

// ------------------------------
// 坊市全局配置
// ------------------------------
export const FANGSHI_CONFIG = {
  fbBaseCount: 10,
  dyBaseCount: 10,
  clBaseCount: 10,
  dfBaseCount: 10,
  dyPriceScale: 0.25,
  dfPriceScale: 0.25,
  randDyCount: 10,
  randClCount: 10,
  randDfCount: 10,
  negChanceMain: 0.2,
  negChanceExtra: 0.3,
  baojiNegChance: 0.15,
  negScaleMin: 0.35,
  negScaleMax: 0.6,
  fbTierCounts: {
    法器: 3,
    灵器: 3,
    法宝: 2,
    古宝: 2,
    灵宝: 2,
    后天灵宝: 1,
    先天灵宝: 1,
    通天灵宝: 1
  } as Record<string, number>
};

// ------------------------------
// 材料配置
// ------------------------------
export const caiLiaoBaseList = [
  { name: '洗骨花', desc: '材料，用于炼制丹药', itype: '一品', ls: 8 },
  { name: '千叶草', desc: '材料，用于炼制丹药', itype: '一品', ls: 10 },
  { name: '玫瑰花', desc: '材料，用于炼制丹药', itype: '一品', ls: 25 },
  { name: '妖丹', desc: '材料，用于炼制丹药', itype: '一品', ls: 80 },
  { name: '万灵草', desc: '材料，用于炼制丹药', itype: '三品', ls: 800 },
  { name: '升灵石', desc: '稀有的洞府升阶材料', itype: '四品', ls: 5000 }
];

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

// ------------------------------
// 材料注册与初始化配置
// ------------------------------
export const MATERIAL_INIT_COUNT = 1000;
export const ACTOR_POOL_CONFIG = {
  countPerGrade: 200,
  gongfaCountPerGrade: 300
};

// 材料注册项
export type MaterialRegistryItem = {
  name: string;
  itype: (typeof clGrades)[number];
};

// 种子注册项
export type SeedRegistryItem = {
  name: string;
  material: string;
  itype: (typeof clGrades)[number];
  time: [number, number, number];
};

// 材料池，按等级分类
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
  { name: '万灵草', itype: '三品' },
  { name: '升灵石', itype: '四品' },
  { name: '草灵', itype: '一品' },
  { name: '百灵血竹', itype: '二品' },
  { name: '彳果', itype: '二品' },
  { name: '枯木灵藤', itype: '三品' },
  { name: '木之精华', itype: '三品' },
  { name: '柔水', itype: '二品' },
  { name: '灵玉液', itype: '四品' },
  { name: '水华', itype: '四品' },
  { name: '魔晶', itype: '一品' },
  { name: '玄纹髓', itype: '五品' },
  { name: '霜魄晶', itype: '六品' },
  { name: '幽炎砂', itype: '七品' },
  { name: '残·龙魂', itype: '八品' },
  { name: '凤凰翎', itype: '五品' },
  { name: '麒麟角', itype: '五品' },
  { name: '万年温玉', itype: '六品' },
  { name: '九天玄铁', itype: '六品' },
  { name: '星辰砂', itype: '七品' },
  { name: '混沌之气', itype: '七品' },
  { name: '鸿蒙紫气', itype: '八品' },
  { name: '天道碎片', itype: '八品' }
];
export const MATERIAL_GRADE_COUNTS: Record<(typeof clGrades)[number], number> =
  {
    一品: 10,
    二品: 8,
    三品: 6,
    四品: 6,
    五品: 6,
    六品: 5,
    七品: 4,
    八品: 4
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
export const createMaterialPoolByGrade = (options?: {
  seed?: string;
  countPerGrade?: number;
}) => {
  const rng = createRng(options?.seed);
  const countPerGrade =
    options?.countPerGrade ?? ACTOR_POOL_CONFIG.countPerGrade;
  const pool = clGrades.reduce((acc, grade) => {
    acc[grade] = [];
    return acc;
  }, {} as MaterialPoolByGrade);
  const used = new Set<string>();
  MATERIAL_BASE_LIST.forEach((item) => {
    used.add(item.name);
    pool[item.itype].push(item);
  });
  clGrades.forEach((grade) => {
    const current = pool[grade].length;
    const need = Math.max(0, countPerGrade - current);
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
      pool[grade].push({ name, itype: grade });
    }
  });
  return pool;
};
export const flattenMaterialPool = (pool?: MaterialPoolByGrade) => {
  if (!pool) return [];
  return clGrades.flatMap((grade) => pool[grade] ?? []);
};

// ------------------------------
// 丹方配置
// ------------------------------
export const danfangIds = [
  '10001',
  '10002',
  '10003',
  '10004',
  '20001',
  '20002',
  '10005',
  '10006',
  '10007',
  '10008',
  '10009',
  '10010',
  '20003',
  '20004',
  '20005',
  '20006',
  '20007'
] as const;
export const dfGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;

// ------------------------------
// 丹药配置
// ------------------------------
export const dyNameParts = [
  ['清', '养', '凝', '回', '复', '镇', '冲', '通', '启', '宁', '淬', '固'],
  ['神', '元', '气', '脉', '识', '灵', '身', '魂'],
  ['丹']
] as const;
export const dyGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;
export const dyGradeMultipliers: Record<(typeof dyGrades)[number], number> = {
  一品: 1.0,
  二品: 1.2,
  三品: 1.5,
  四品: 1.9,
  五品: 2.4,
  六品: 2.9,
  七品: 3.5,
  八品: 4.2
};
export const dyRarityLevels = ['普通', '稀有', '罕见', '史诗', '传说'] as const;
export const dyRarityMultipliers: Record<
  (typeof dyRarityLevels)[number],
  number
> = { 普通: 1.0, 稀有: 1.15, 罕见: 1.35, 史诗: 1.65, 传说: 2.0 };
export const DY_EFFECT_SCALE: Record<
  (typeof dyGrades)[number],
  {
    shenshi: [number, number];
    xiuwei: [number, number];
    price: [number, number];
  }
> = {
  一品: { shenshi: [4, 6], xiuwei: [1, 2], price: [4000, 8000] },
  二品: { shenshi: [8, 12], xiuwei: [2, 3], price: [8000, 15000] },
  三品: { shenshi: [12, 18], xiuwei: [4, 6], price: [15000, 30000] },
  四品: { shenshi: [20, 28], xiuwei: [8, 12], price: [30000, 60000] },
  五品: { shenshi: [35, 50], xiuwei: [15, 25], price: [60000, 120000] },
  六品: { shenshi: [60, 80], xiuwei: [25, 35], price: [120000, 220000] },
  七品: { shenshi: [90, 120], xiuwei: [40, 55], price: [220000, 400000] },
  八品: { shenshi: [130, 170], xiuwei: [60, 80], price: [400000, 700000] }
};

export const DANFANG_CATEGORY_CONFIG = {
  恢复神识类: { ids: ['10001', '10002', '10005', '10006', '10007'], count: 1 },
  增加修为类: { ids: ['10003', '10004', '10008', '10009', '10010'], count: 1 },
  突破类: {
    ids: ['20001', '20002', '20003', '20004', '20005', '20006', '20007'],
    count: 1
  }
} as const;

// ------------------------------
// 境界配置
// ------------------------------
export const REALM_ORDER = [
  '练气',
  '筑基',
  '结丹',
  '元婴',
  '化神',
  '返虚',
  '合体',
  '大乘'
];
export const REALM_GRADE_WEIGHTS: Record<
  (typeof REALM_ORDER)[number],
  number[]
> = {
  练气: [12, 6, 3, 1, 0, 0, 0, 0],
  筑基: [8, 10, 6, 2, 1, 0, 0, 0],
  结丹: [4, 8, 10, 5, 2, 1, 0, 0],
  元婴: [2, 5, 8, 10, 5, 2, 1, 0],
  化神: [0, 3, 6, 9, 9, 4, 2, 1],
  返虚: [0, 1, 4, 7, 9, 7, 4, 2],
  合体: [0, 0, 2, 5, 7, 9, 8, 4],
  大乘: [0, 0, 1, 3, 6, 9, 10, 8]
};
export const PJ_BY_REALM = [
  FabaoPinjie.练气,
  FabaoPinjie.筑基,
  FabaoPinjie.结丹,
  FabaoPinjie.元婴,
  FabaoPinjie.化神,
  FabaoPinjie.返虚,
  FabaoPinjie.合体,
  FabaoPinjie.大乘
];

// ------------------------------
// 刷新与定时
// ------------------------------
export const FANGSHI_REFRESH_INTERVAL = 10 * 60 * 1000;
export const XIUXIAN_TIME_SCALE_DEFAULT = 1;
