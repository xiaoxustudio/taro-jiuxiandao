import danfangData from '@/assets/danfang.json';
import { CWType } from '@/types';

export type FangshiCategoryKey = 'fb' | 'dy' | 'cl' | 'df';

type FangshiItem = {
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

const fangshiFaBao: FangshiItem[] = [
  {
    name: '白鹿冠',
    type: CWType.FB,
    attr: {
      fangyu: 20
    },
    lv: 0,
    pj: '法器',
    itype: '头戴战盔',
    isPile: false,
    desc: '古法门炼制',
    ls: 5900
  },
  {
    name: '白玉戒指',
    type: CWType.FB,
    attr: {
      qixue: 326
    },
    lv: 0,
    pj: '法器',
    itype: '饰品加持',
    isPile: false,
    desc: '晓沐炼制',
    ls: 9900
  },
  {
    name: '赤铁盔',
    type: CWType.FB,
    attr: {
      fangyu: 40
    },
    lv: 0,
    pj: '灵器',
    itype: '头戴战盔',
    isPile: false,
    desc: '器神宗炼制',
    ls: 14400
  },
  {
    name: '赤铁轻靴',
    type: CWType.FB,
    attr: {
      sudu: 95
    },
    lv: 0,
    pj: '通天灵宝',
    itype: '鞋子护腿',
    isPile: false,
    desc: '慕容老祖炼制',
    ls: 230800
  },
  {
    name: '赤血剑',
    type: CWType.FB,
    attr: {
      gongji: 91
    },
    lv: 0,
    pj: '法器',
    itype: '手持武器',
    isPile: false,
    desc: '古器门炼制',
    ls: 12900
  },
  {
    name: '东皇剑',
    type: CWType.FB,
    attr: {
      gongji: 76
    },
    lv: 0,
    pj: '法器',
    itype: '手持武器',
    isPile: false,
    desc: '古器门炼制',
    ls: 7600
  },
  {
    name: '金鳞玉罗袍',
    type: CWType.FB,
    attr: {
      gongji: 1670,
      fangyu: 65
    },
    lv: 0,
    pj: '法器',
    itype: '手持武器',
    isPile: false,
    desc: '古器门炼制',
    ls: 373600
  },
  {
    name: '蓝玉腰带',
    type: CWType.FB,
    attr: {
      gongji: 150,
      fangyu: 17
    },
    lv: 0,
    pj: '法器',
    itype: '腰带护具',
    isPile: false,
    desc: '器神宗炼制',
    ls: 10100
  },
  {
    name: '蓝月头巾',
    type: CWType.FB,
    attr: {
      qixue: 100,
      fangyu: 20
    },
    lv: 0,
    pj: '法器',
    itype: '头戴战盔',
    isPile: false,
    desc: '器神宗炼制',
    ls: 9400
  },
  {
    name: '绫虚沐羽佩',
    type: CWType.FB,
    attr: {
      qixue: 650,
      fangyu: 90
    },
    lv: 0,
    pj: '通天灵宝',
    itype: '腰带护具',
    isPile: false,
    desc: '雨天★彬炼制',
    ls: 228300
  },
  {
    name: '凌云彩带',
    type: CWType.FB,
    attr: {
      qixue: 360,
      fangyu: 45
    },
    lv: 0,
    pj: '灵器',
    itype: '腰带护具',
    isPile: false,
    desc: '紫痕炼制',
    ls: 31300
  },
  {
    name: '流云履',
    type: CWType.FB,
    attr: {
      sudu: 65
    },
    lv: 0,
    pj: '灵器',
    itype: '鞋子护腿',
    isPile: false,
    desc: '星痕尊者炼制',
    ls: 30800
  },
  {
    name: '柳叶靴',
    type: CWType.FB,
    attr: {
      sudu: 46
    },
    lv: 0,
    pj: '法器',
    itype: '鞋子护腿',
    isPile: false,
    desc: '天绣坊炼制',
    ls: 10870
  },
  {
    name: '龙骨指环',
    type: CWType.FB,
    attr: {
      gongji: 115,
      qixue: 978,
      fangyu: 70
    },
    lv: 0,
    pj: '通天灵宝',
    itype: '饰品加持',
    isPile: false,
    desc: '慕容老祖炼制',
    ls: 1239900
  },
  {
    name: '青布道衣',
    type: CWType.FB,
    attr: {
      qixue: 800,
      fangyu: 25
    },
    lv: 0,
    pj: '灵器',
    itype: '身穿战甲',
    isPile: false,
    desc: '器神宗炼制',
    ls: 21300
  },
  {
    name: '青云木灵剑',
    type: CWType.FB,
    attr: {
      qixue: 395,
      fangyu: 60
    },
    lv: 0,
    pj: '通天灵宝',
    itype: '手持武器',
    isPile: false,
    desc: '器神宗炼制',
    ls: 473600
  },
  {
    name: '青云袍',
    type: CWType.FB,
    attr: {
      qixue: 500
    },
    lv: 0,
    pj: '法器',
    itype: '身穿战甲',
    isPile: false,
    desc: '星痕炼制',
    ls: 5400
  },
  {
    name: '四象腰带',
    type: CWType.FB,
    attr: {
      qixue: 350,
      fangyu: 40
    },
    lv: 0,
    pj: '灵器',
    itype: '腰带护具',
    isPile: false,
    desc: '狱龙子炼制',
    ls: 28300
  },
  {
    name: '踏云靴',
    type: CWType.FB,
    attr: {
      sudu: 15,
      fangyu: 25
    },
    lv: 0,
    pj: '法器',
    itype: '鞋子护腿',
    isPile: false,
    desc: '狱龙子炼制',
    ls: 7800
  },
  {
    name: '伪诛仙剑',
    type: CWType.FB,
    attr: {
      gongji: 8400,
      baoji: 5
    },
    lv: 0,
    pj: '通天灵宝',
    itype: '手持武器',
    isPile: false,
    desc: '方寸老祖炼制',
    ls: 99990000
  },
  {
    name: '易云剑',
    type: CWType.FB,
    attr: {
      gongji: 125,
      fangyu: 20
    },
    lv: 0,
    pj: '灵器',
    itype: '手持武器',
    isPile: false,
    desc: '古器门炼制',
    ls: 36200
  },
  {
    name: '御风履',
    type: CWType.FB,
    attr: {
      sudu: 92
    },
    lv: 0,
    pj: '灵器',
    itype: '鞋子护腿',
    isPile: false,
    desc: '星痕尊者炼制',
    ls: 88880
  },
  {
    name: '紫晶项链',
    type: CWType.FB,
    attr: {
      gongji: 80,
      qixue: 678,
      fangyu: 40
    },
    lv: 0,
    pj: '灵器',
    itype: '饰品加持',
    isPile: false,
    desc: '星痕尊者炼制',
    ls: 939900
  },
  {
    name: '紫云枪',
    type: CWType.FB,
    attr: {
      gongji: 175,
      fangyu: 10
    },
    lv: 0,
    pj: '灵器',
    itype: '手持武器',
    isPile: false,
    desc: '星痕尊者炼制',
    ls: 57800
  }
];

const fangshiCaiLiao: FangshiItem[] = [
  {
    name: '洗骨花',
    type: CWType.QT,
    isPile: true,
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 30
  },
  {
    name: '千叶草',
    type: CWType.QT,
    isPile: true,
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 30
  },
  {
    name: '玫瑰花',
    type: CWType.QT,
    isPile: true,
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 99
  },
  {
    name: '妖丹',
    type: CWType.QT,
    isPile: true,
    desc: '材料，用于炼制丹药',
    itype: '一品',
    ls: 300
  },
  {
    name: '万灵草',
    type: CWType.QT,
    isPile: true,
    desc: '材料，用于炼制丹药',
    itype: '三品',
    ls: 10000
  }
];

const danfangIds = ['10001', '10002', '10003', '10004', '20001', '20002'];

const createDanYaoList = (): FangshiItem[] =>
  danfangIds.map((id) => ({
    ...danfangData[id],
    type: CWType.DY,
    ls: danfangData[id].ls * 0.9
  }));

const createDanFangList = (): FangshiItem[] =>
  danfangIds.map((id) => ({
    ...danfangData[id],
    name: `${danfangData[id].name}丹方`,
    id
  }));

export const fangshiCategories = [
  {
    key: 'fb',
    label: '法宝',
    action: 'item',
    list: () => fangshiFaBao
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
    list: () => fangshiCaiLiao
  },
  {
    key: 'df',
    label: '丹方',
    action: 'danfang',
    list: () => createDanFangList()
  }
] as const;
