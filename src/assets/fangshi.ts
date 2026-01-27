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
  attr?: Record<string, number>;
  lv?: number;
  pj?: string;
  id?: string;
};

export type FangshiSnapshot = {
  updatedAt: number;
  realm: string;
  items: Record<FangshiCategoryKey, FangshiItem[]>;
};

type FaBaoBaseItem = Omit<FangshiItem, 'type' | 'lv' | 'isPile'>;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(list: T[]) => list[rand(0, list.length - 1)];

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
          name = `${name}${rand(1, 99)}`;
        }
        usedNames.add(name);
        const mainBase = rand(tier.attrRange[0], tier.attrRange[1]);
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
            const bVal = rand(1, maxB);
            attrs.baoji =
              Math.random() < FANGSHI_CONFIG.baojiNegChance
                ? -rand(1, Math.max(1, Math.floor(maxB / 2)))
                : bVal;
          } else {
            const extraBase = rand(tier.extraRange[0], tier.extraRange[1]);
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
          ls: rand(tier.lsRange[0], tier.lsRange[1])
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

const danfangIds = ['10001', '10002', '10003', '10004', '20001', '20002'];

const createDanYaoList = (): FangshiItem[] =>
  danfangIds.map((id) => ({
    ...danfangData[id],
    type: CWType.DY,
    ls: Math.round(danfangData[id].ls * FANGSHI_CONFIG.dyPriceScale)
  }));

const createDanFangList = (): FangshiItem[] =>
  danfangIds.map((id) => ({
    ...danfangData[id],
    name: `${danfangData[id].name}丹方`,
    id,
    ls: Math.round(danfangData[id].ls * FANGSHI_CONFIG.dfPriceScale)
  }));

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

const getRealmIndex = (realm: string) => {
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
  const poolSize = Math.max(2, Math.ceil(sorted.length * realmRate));
  const pool = sorted.slice(0, Math.min(sorted.length, poolSize));
  const count = Math.min(pool.length, baseCount + realmIndex);
  return shuffle(pool).slice(0, count);
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
  const dyList = createDanYaoList();
  const clList = createCaiLiaoList();
  const dfList = createDanFangList();
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
