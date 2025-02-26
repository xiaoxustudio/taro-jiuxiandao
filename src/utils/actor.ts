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

export {
  getActor,
  getLingQiForJingJie,
  getLingQiForRate,
  getLingQiToNumber,
  HasActor
};

