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
