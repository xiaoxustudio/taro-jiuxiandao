import useActorStore from '@/store/actor';
import useStore from '@/store/store';

/**
 * @description: 获取当前角色数据
 * @return {*}
 */
function getActor() {
  const { current } = useStore.getState();
  const actor = useActorStore.getState();
  const acData = actor[current];
  return acData;
}

/**
 * @description: 判断是否有该角色
 * @param {string} name
 * @return {*}
 */
function HasActor(name: string) {
  const actor = useActorStore.getState();
  const acData = actor[name];
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

const JingJie1Transform = (j: string) => {
  switch (j) {
    case '一阶':
      return '二阶';
    case '二阶':
      return '三阶';
    case '三阶':
      return '四阶';
    case '四阶':
      return '五阶';
    case '五阶':
      return '六阶';
    case '六阶':
      return '七阶';
    case '七阶':
      return '八阶';
    case '八阶':
      return '九阶';
    case '九阶':
      return '一阶';
  }
};
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

