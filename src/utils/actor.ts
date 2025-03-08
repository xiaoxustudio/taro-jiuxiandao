import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { chineseToNumber, numberToChinese } from '.';
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
  let dj = 0;
  switch (actor.jingjie) {
    case '练气':
      dj = 0;
      break;
    case '筑基':
      dj = 1;
      break;
    case '结丹':
      dj = 2;
      break;
    case '元婴':
      dj = 3;
      break;
    case '化神':
      dj = 4;
      break;
    case '返虚':
      dj = 5;
      break;
    case '合体':
      dj = 6;
      break;
    case '大乘':
      dj = 7;
      break;
    default:
      dj = 0;
      break;
  }
  return dj;
}

/**
 * @description: 根据境界获取修为加成
 * @return {*}
 */
function getLingQiForJingJie() {
  const actor = getActor();
  let xw = 0;
  switch (actor.jingjie) {
    case '练气':
      xw = 1000;
      break;
    case '筑基':
      xw = 500;
      break;
    case '结丹':
      xw = 800;
      break;
    case '元婴':
      xw = 1200;
      break;
    case '化神':
      xw = 1400;
      break;
    case '返虚':
      xw = 1600;
      break;
    case '合体':
      xw = 1800;
      break;
    case '大乘':
      xw = 1800;
      break;
    default:
      xw = 1000;
      break;
  }
  return xw;
}

/**
 * @description: 根据境界获取修为增幅数值
 * @return {*}
 */
function getLingQiForRate() {
  const actor = getActor();
  let xw = 0;
  switch (actor.jingjie) {
    case '练气':
      xw = 600;
      break;
    case '筑基':
      xw = 800;
      break;
    case '结丹':
      xw = 1200;
      break;
    case '元婴':
      xw = 1500;
      break;
    case '化神':
      xw = 1800;
      break;
    case '返虚':
      xw = 2200;
      break;
    case '合体':
      xw = 2500;
      break;
    case '大乘':
      xw = 3000;
      break;
    default:
      xw = 600;
      break;
  }
  return xw;
}

/**
 * @description: 获取每个境界最大小境界
 * @return {*}
 */
export const getJingJieMaxDep = () => {
  const actor = getActor();
  switch (actor.jingjie) {
    case '练气':
      return 12;
    case '筑基':
    case '结丹':
    case '元婴':
    case '化神':
    case '返虚':
    case '合体':
    case '大乘':
      return 9;
    default:
      return 9;
  }
};

/**
 * @description: 小境界或数字转换为小境界
 * @param {string} s
 * @param {*} max_dep
 * @param {*} addNum
 * @return {*}
 */
export function TransformToJingJie1(
  s: string | number,
  max_dep = 9,
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
  if (next > max_dep) {
    next = 1;
  }

  const nextChinese = numberToChinese(next);
  return nextChinese ? `${nextChinese}阶` : '一阶';
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
};

export {
  getActor,
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  HasActor,
  JingJie1Transform,
  JingJieTransform
};

