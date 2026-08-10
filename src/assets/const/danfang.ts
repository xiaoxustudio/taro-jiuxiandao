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
