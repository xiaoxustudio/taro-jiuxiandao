import { random } from 'lodash-es';
import danfangData from '@/assets/danfang.json';
import { CWType, FabaoPinjie } from '@/types';

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

const faBaoTierConfig = [
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

const faBaoTypeConfig = [
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
  }
];

const faBaoLocationPool = [
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

const mainAttrMultiplier: Record<string, number> = {
  gongji: 2.2,
  qixue: 1.6,
  fangyu: 1.2,
  sudu: 1
};

const extraAttrMultiplier: Record<string, number> = {
  gongji: 1.4,
  qixue: 1.1,
  fangyu: 0.9,
  sudu: 0.8
};

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
        const attrs: Record<string, number> = {
          [type.mainAttr]: negMain
        };
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

const caiLiaoBaseList: CaiLiaoBaseItem[] = [
  {
    name: '洗骨花',
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 8
  },
  {
    name: '千叶草',
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 10
  },
  {
    name: '玫瑰花',
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 25
  },
  {
    name: '妖丹',
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 80
  },
  {
    name: '万灵草',
    desc: '材料，用于炼制丹药',
    itype: '三品',
    ls: 800
  }
];

const createCaiLiaoList = (): FangshiItem[] =>
  caiLiaoBaseList.map((item) => ({
    ...item,
    type: CWType.QT,
    isPile: true
  }));

const clNameParts = [
  ['灵', '玄', '玉', '雪', '苍', '赤', '紫', '青', '黑', '金'],
  ['心', '魄', '魂', '元', '神', '华', '纹', '影', '痕', '息'],
  ['草', '花', '藤', '木', '液', '砂', '石', '晶', '萃', '页']
] as const;

// 练气 （一品）、筑基（二品） 、结丹（三品） 、元婴（四品） 、化神（五品） 、返虚（六品） 、合体（七品） 、大乘（八品）
const clGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;
const clGradePrice: Record<(typeof clGrades)[number], [number, number]> = {
  一品: [6, 30],
  二品: [50, 200],
  三品: [300, 1200],
  四品: [2000, 6000],
  五品: [8000, 20000],
  六品: [16000, 40000],
  七品: [32000, 80000],
  八品: [64000, 160000]
};
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
const dfGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;

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

const dyNameParts = [
  ['清', '养', '凝', '回', '复', '镇', '冲', '通', '启', '宁', '淬', '固'],
  ['神', '元', '气', '脉', '识', '灵', '身', '魂'],
  ['丹']
] as const;
const dyGrades = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品'
] as const;
const dyGradeMultipliers: Record<(typeof dyGrades)[number], number> = {
  一品: 1.0,
  二品: 1.2,
  三品: 1.5,
  四品: 1.9,
  五品: 2.4,
  六品: 2.9,
  七品: 3.5,
  八品: 4.2
};
const dyRarityLevels = ['普通', '稀有', '罕见', '史诗', '传说'] as const;
const dyRarityMultipliers: Record<(typeof dyRarityLevels)[number], number> = {
  普通: 1.0,
  稀有: 1.15,
  罕见: 1.35,
  史诗: 1.65,
  传说: 2.0
};
const pickRarity = (p: number) => {
  if (p < 0.5) return dyRarityLevels[0];
  if (p < 0.75) return dyRarityLevels[1];
  if (p < 0.9) return dyRarityLevels[2];
  if (p < 0.97) return dyRarityLevels[3];
  return dyRarityLevels[4];
};
const DY_EFFECT_SCALE: Record<
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
    const filteredPool = materialPool.filter(
      (item) => getGradeIndex(item.itype, clGrades) <= gradeIndex && item.name
    );
    const pool = filteredPool.length ? filteredPool : materialPool;
    const pickCount = Math.min(
      pool.length,
      Math.max(2, 2 + Math.floor(gradeIndex / 2) + random(0, 1))
    );
    const picked: FangshiItem[] = [];
    const mutablePool = [...pool];
    for (let j = 0; j < pickCount && mutablePool.length; j += 1) {
      const idx = random(0, mutablePool.length - 1);
      picked.push(mutablePool.splice(idx, 1)[0]);
    }
    const cl = picked.map((item): [string, number] => {
      const clGradeIndex = getGradeIndex(item.itype, clGrades);
      const minNum = 1 + Math.max(0, gradeIndex - clGradeIndex);
      const maxNum = 3 + gradeIndex + Math.max(0, gradeIndex - clGradeIndex);
      return [item.name, random(minNum, maxNum)];
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

export const DANFANG_CATEGORY_CONFIG = {
  恢复神识类: {
    ids: ['10001', '10002', '10005', '10006', '10007'],
    count: 1
  },
  增加修为类: {
    ids: ['10003', '10004', '10008', '10009', '10010'],
    count: 1
  },
  突破类: {
    ids: ['20001', '20002', '20003', '20004', '20005', '20006', '20007'],
    count: 1
  }
} as const;

export const fangshiCategories = [
  {
    key: 'fb',
    label: '法宝',
    action: 'item',
    list: () => createFaBaoList()
  },
  {
    key: 'dy',
    label: '丹药',
    action: 'item',
    list: () => createDanYaoList()
  },
  {
    key: 'cl',
    label: '材料',
    action: 'item',
    list: () => createCaiLiaoList()
  },
  {
    key: 'df',
    label: '丹方',
    action: 'danfang',
    list: () => createDanFangList()
  }
] as const;

const REALM_ORDER = [
  '练气',
  '筑基',
  '结丹',
  '元婴',
  '化神',
  '返虚',
  '合体',
  '大乘'
];

const PJ_BY_REALM = [
  FabaoPinjie.练气,
  FabaoPinjie.筑基,
  FabaoPinjie.结丹,
  FabaoPinjie.元婴,
  FabaoPinjie.化神,
  FabaoPinjie.返虚,
  FabaoPinjie.合体,
  FabaoPinjie.大乘
];

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

export const FANGSHI_REFRESH_INTERVAL = 10 * 60 * 1000;

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
    ...createRandomDanFangList(
      FANGSHI_CONFIG.randDfCount,
      realmIndex,
      randomClList
    )
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
