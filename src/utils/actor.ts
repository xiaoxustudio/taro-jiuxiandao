import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import type { ActorDataConfig } from '@/types';
import { chineseToNumber } from '.';

const MAJOR_REALMS = [
  '练气',
  '筑基',
  '结丹',
  '元婴',
  '化神',
  '返虚',
  '合体',
  '大乘'
] as const;
const BASE_XIUWEI_BY_REALM = [
  800, 3000, 12000, 50000, 200000, 800000, 3200000, 12800000
];
const MAX_MINOR_BY_REALM = [12, 9, 9, 9, 9, 9, 9, 9];

// 轮回印记增益配置（每层）
// 注意: xiulianbeilv 存储值为实际倍率×10（如10表示1.0倍），由 xlBeilv = xiulianbeilv / 10 换算
export const LUNHUI_BUFF_PER_COUNT = {
  xiulianbeilvBonus: 2, // 修炼倍率 +2（存储值，即实际 +0.2 倍，最终 +20%）
  maxShenshiBonus: 25, // 神识上限 +25
  shouyuanBonus: 50, // 寿元上限 +50
  initialXiuweiBonus: 100, // 初始修为 +100
  shangxianBonus: 3 // 全属性伤害加成 +3%
};
/* 角色相关操作 */

/**
 * @description: 获取当前角色数据
 * @return {*}
 */
function getActor() {
  const { current } = useStore.getState();
  const { actors } = useActorStore.getState();
  const acData = actors[current];
  return acData;
}

/**
 * @description: 获取当前角色数据，不存在时返回 null
 * @return {*}
 */
function getSafeActor(): ActorDataConfig | null {
  return getActor() ?? null;
}

/**
 * @description: 判断是否有该角色
 * @param {string} name
 * @return {*}
 */
function HasActor(name: string) {
  const { actors } = useActorStore.getState();
  const acData = actors[name];
  return !!acData;
}

/**
 * @description: 境界转换number
 * @return {*}
 */
function getLingQiToNumber() {
  const actor = getSafeActor();
  const idx = MAJOR_REALMS.indexOf(
    (actor?.jingjie ?? '') as (typeof MAJOR_REALMS)[number]
  );
  return idx >= 0 ? idx : 0;
}

/**
 * @description: 根据境界获取修为加成
 * @return {*}
 */
function getLingQiForJingJie() {
  const actor = getSafeActor();
  const idx = MAJOR_REALMS.indexOf(
    (actor?.jingjie ?? '') as (typeof MAJOR_REALMS)[number]
  );
  const i = idx >= 0 ? idx : 0;
  return BASE_XIUWEI_BY_REALM[i];
}

/**
 * @description: 获取每个境界最大小境界
 * @return {*}
 */
export const getJingJieMaxDep = () => {
  const actor = getSafeActor();
  const idx = MAJOR_REALMS.indexOf(
    (actor?.jingjie ?? '') as (typeof MAJOR_REALMS)[number]
  );
  const i = idx >= 0 ? idx : 0;
  return MAX_MINOR_BY_REALM[i] ?? 9;
};

/**
 * @description: 阶段境界转换
 * @param {string} s
 * @return {*}
 */
function JingJie2Transform(s: string) {
  const arr = ['初期', '中期', '后期', '圆满', '大圆满'];
  const f = arr.findIndex((v) => v === s);
  if (f === -1 || f >= arr.length - 1) return arr[0];
  return arr[f + 1];
}

/**
 * @description: 小境界转换为数字
 * @param {string} s
 * @return {*}
 */
export const JingJie1ToNumber = (s: string) =>
  chineseToNumber(s.replace('阶', ''));

/**
 * @description: 转换大境界
 * @param {string} j
 * @return {*}
 */
const JingJieTransform = (j: string) => {
  switch (j) {
    case '练气':
      return '筑基';
    case '筑基':
      return '结丹';
    case '结丹':
      return '元婴';
    case '元婴':
      return '化神';
    case '化神':
      return '返虚';
    case '返虚':
      return '合体';
    case '合体':
      return '大乘';
    default:
      return j;
  }
};

export {
  getActor,
  getLingQiForJingJie,
  getLingQiToNumber,
  HasActor,
  JingJie2Transform,
  JingJieTransform
};

// ==================== 轮回系统 ====================

/**
 * 根据轮回次数获取轮回增益描述
 */
export function getLunhuiBuffs(count: number = 0) {
  if (count <= 0) return null;
  return {
    xiulianbeilvBonus: LUNHUI_BUFF_PER_COUNT.xiulianbeilvBonus * count,
    maxShenshiBonus: LUNHUI_BUFF_PER_COUNT.maxShenshiBonus * count,
    shouyuanBonus: LUNHUI_BUFF_PER_COUNT.shouyuanBonus * count,
    initialXiuweiBonus: LUNHUI_BUFF_PER_COUNT.initialXiuweiBonus * count,
    shangxianBonus: LUNHUI_BUFF_PER_COUNT.shangxianBonus * count
  };
}
