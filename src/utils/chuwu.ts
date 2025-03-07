import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { BaseType, CWType, DYType, FBType, QTType } from '@/types';
import { getActor } from './actor';
// 角色储物

export interface AddProps extends BaseType {
  name: string;
  type: CWType;
  [k: string]: any;
}

export interface OperaterType {
  name: string;
  type: CWType;
  num?: number;
}

function TR(type: CWType) {
  switch (type) {
    case CWType.FB:
      return 'fb';
    case CWType.DY:
      return 'dy';
    case CWType.QT:
      return 'qt';
    default:
      return 'fb';
  }
}

/**
 * @description: 是否有该物品，没有为-1
 * @param {object} param1
 * @return {*}
 */
function Has({ name, type = CWType.FB }: OperaterType) {
  const acData = getActor();
  const cw = acData.cw[TR(type)];
  let index = -1;
  cw.some((v: BaseType, ind: number) => {
    index = ind;
    return v.name === name;
  });
  return index;
}

/**
 * @description: 获取该物品
 * @param {object} param1
 * @return {*}
 */
function Get({ name, type = CWType.FB }: OperaterType) {
  const acData = getActor();
  const cw = acData.cw[TR(type)];
  return cw.find((v: BaseType) => v.name === name);
}

/**
 * @description: 移除该物品
 * @param {object} param1
 * @return {*}
 */
function Remove(item: OperaterType) {
  const { current } = useStore.getState();
  const acData = getActor();
  const { set } = useActorStore.getState();
  const ItemData = Get(item);
  const lessNum = (ItemData!.num! || 1) - (item.num || 0);
  let cw: BaseType[];
  switch (item.type) {
    case CWType.QT:
      cw = acData.cw.qt;
      break;
    case CWType.FB:
      cw = acData.cw.fb;
      break;
    case CWType.DY:
      cw = acData.cw.dy;
      break;
  }
  // 如果为0，，则直接删除
  if (lessNum <= 0) {
    cw = cw.filter((v) => !(JSON.stringify(v) === JSON.stringify(ItemData)));
  } else {
    cw = cw.map((v) => {
      if (v === ItemData) {
        v.num = lessNum;
      }
      return v;
    });
  }
  switch (item.type) {
    case CWType.QT:
      acData.cw.qt = cw as QTType[];
      break;
    case CWType.FB:
      acData.cw.fb = cw as FBType[];
      break;
    case CWType.DY:
      acData.cw.dy = cw as DYType[];
      break;
  }
  // 设置数据
  set(current, acData);
  return;
}

/**
 * @description: 添加物品
 * @param {AddProps} param1
 * @return {*}
 */
function Add({
  name,
  type = CWType.FB,
  num = 1,
  isPile = false,
  ...props
}: AddProps) {
  const { current } = useStore.getState();
  const acData = getActor();
  const { set } = useActorStore.getState();
  if (!isPile) {
    num = 1;
  }
  const has = Has({ name, type });
  const baseObject = {
    name,
    isPile,
    num,
    ...props,
  };
  switch (type) {
    case CWType.QT:
      {
        const target = acData.cw.qt[has];
        if (~has && target.num) {
          target.num += num;
        } else {
          acData.cw.qt.push({
            type: CWType.QT,
            ...baseObject,
          });
        }
      }
      break;
    case CWType.FB:
      {
        const target = acData.cw.fb[has];
        if (~has && target.num) {
          target.num += num;
        } else {
          acData.cw.fb.push({
            type: CWType.FB,
            ...baseObject,
          });
        }
      }
      break;
    case CWType.DY:
      {
        const target = acData.cw.fb[has];
        if (~has && target.num) {
          target.num += num;
        } else {
          acData.cw.dy.push({
            type: CWType.DY,
            ...baseObject,
          });
        }
      }
      break;
  }
  set(current, acData);
  return;
}

/**
 * @description: 灵石是否大于等于
 * @param {number} num
 * @return {*}
 */
function LingShiThan(num: number = 0) {
  const lsStruct = { name: '灵石', type: CWType.QT };
  const lsData = Get(lsStruct);
  if (!lsData) {
    return false;
  }
  const _num = lsData.num ? lsData.num : 1;
  return _num >= num;
}

export default { Add, Has, Get, Remove, getActor, TR, LingShiThan };
