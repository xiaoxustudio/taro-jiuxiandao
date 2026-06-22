import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { chineseToNumber, numberToChinese } from '.';

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
const BASE_XIUWEI_BY_REALM = [800, 1200, 1600, 2000, 2500, 3600, 5000, 7000];
const RATE_OF_LING_BY_REALM = [600, 800, 1200, 1500, 1800, 2200, 2800, 3500];
const MAX_MINOR_BY_REALM = [12, 9, 9, 9, 9, 9, 9, 9];

// 轮回印记增益配置（每层）
export const LUNHUI_BUFF_PER_COUNT = {
  xiulianbeilvBonus: 2, // 修炼倍率 +2（即最终 +20%）
  maxShenshiBonus: 20, // 神识上限 +20
  shouyuanBonus: 50, // 寿元上限 +50
  initialXiuweiBonus: 200, // 初始修为 +200
  shangxianBonus: 5 // 全属性伤害加成 +5%
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
  const actor = getActor();
  const idx = MAJOR_REALMS.indexOf(
    actor.jingjie as (typeof MAJOR_REALMS)[number]
  );
  return idx >= 0 ? idx : 0;
}

/**
 * @description: 根据境界获取修为加成
 * @return {*}
 */
function getLingQiForJingJie() {
  const actor = getActor();
  const idx = MAJOR_REALMS.indexOf(
    actor.jingjie as (typeof MAJOR_REALMS)[number]
  );
  const i = idx >= 0 ? idx : 0;
  return BASE_XIUWEI_BY_REALM[i];
}

/**
 * @description: 根据境界获取修为增幅数值
 * @return {*}
 */
function getLingQiForRate() {
  const actor = getActor();
  const idx = MAJOR_REALMS.indexOf(
    actor.jingjie as (typeof MAJOR_REALMS)[number]
  );
  const i = idx >= 0 ? idx : 0;
  return RATE_OF_LING_BY_REALM[i];
}

/**
 * @description: 获取每个境界最大小境界
 * @return {*}
 */
export const getJingJieMaxDep = () => {
  const actor = getActor();
  const idx = MAJOR_REALMS.indexOf(
    actor.jingjie as (typeof MAJOR_REALMS)[number]
  );
  const i = idx >= 0 ? idx : 0;
  return MAX_MINOR_BY_REALM[i] ?? 9;
};

/**
 * @description: 小境界或数字转换为小境界
 * @param {string} s
 * @param {*} maxDep
 * @param {*} addNum
 * @return {*}
 */
export function TransformToJingJie1(
  s: string | number,
  maxDep = 9,
  addNum = 0
) {
  let current: number = 0;
  if (typeof s === 'string') {
    current = chineseToNumber(s);
    if (current === undefined) {
      return s;
    }
  }

  let next = current + addNum;
  if (next > maxDep) {
    next = 1;
  }

  const nextChinese = numberToChinese(next);
  return nextChinese ? `${nextChinese}阶` : '一阶';
}

/**
 * @description: 阶段境界转换
 * @param {string} s
 * @return {*}
 */
function JingJie2Transform(s: string) {
  const arr = ['初期', '中期', '后期', '圆满', '大圆满'];
  const f = arr.findIndex((v) => v === s);
  // eslint-disable-next-line no-bitwise
  return arr[~f ? f + 1 : 0] || arr[0];
}

/**
 * @description: 小境界转换为数字
 * @param {string} s
 * @return {*}
 */
export const JingJie1ToNumber = (s: string) =>
  chineseToNumber(s.replace('阶', ''));

/**
 * @description: 转换小境界
 * @param {string} j
 * @return {*}
 */
const JingJie1Transform = (j: string) => {
  return TransformToJingJie1(j, getJingJieMaxDep(), 1);
};

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
    case '大乘':
      return '';
  }
  return '';
};

export {
  getActor,
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  HasActor,
  JingJie1Transform,
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
