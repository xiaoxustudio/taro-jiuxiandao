import cloneDeep from 'lodash-es/cloneDeep';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { BaseType, CWType } from '@/types';
import { getActor } from './actor';
/* 角色储物相关操作 */

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

/**
 * @description: 储物类型映射到角色储物字段名
 * @param {CWType} type
 * @return {*}
 */
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
  return (cw as BaseType[]).findIndex((v) => v.name === name);
}
/**
 * @description: 判断是否拥有该物品数组
 * @param {OperaterType} items
 * @return {*}
 */
function HasArr(items: OperaterType[]) {
  return items.every((v) => Has(v) !== -1);
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
  const updated = cloneDeep(acData);
  const typeKey = TR(item.type);
  const cwArray = updated.cw[typeKey] as BaseType[];
  const existingIndex = cwArray.findIndex(
    (v) => v.name === item.name && v.type === item.type
  );
  if (existingIndex === -1) return;
  const currentNum = cwArray[existingIndex]?.num ?? 1;
  const lessNum = currentNum - (item.num || 0);
  if (lessNum <= 0) {
    updated.cw[typeKey] = cwArray.filter((_, i) => i !== existingIndex) as any;
  } else {
    updated.cw[typeKey] = cwArray.map((v, i) =>
      i === existingIndex ? { ...v, num: lessNum } : v
    ) as any;
  }
  set(current, updated);
}

/**
 * @description: 删除物品数组
 * @param {OperaterType[]} items
 * @return {*}
 */
function RemoveArr(items: OperaterType[]) {
  items.forEach((element) => {
    Remove(element);
  });
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
  const updated = cloneDeep(acData);
  const safeNum = isPile ? num : 1;
  const typeKey = TR(type);
  const cwArray = [...(updated.cw[typeKey] as BaseType[])];
  const existingIndex = cwArray.findIndex(
    (v) => v.name === name && v.type === type
  );
  const baseObject = {
    name,
    type,
    isPile,
    num: safeNum,
    ...props
  };
  if (existingIndex !== -1 && cwArray[existingIndex]?.num) {
    cwArray[existingIndex] = {
      ...cwArray[existingIndex],
      num: (cwArray[existingIndex].num || 0) + safeNum
    };
  } else {
    cwArray.push(baseObject as any);
  }
  updated.cw[typeKey] = cwArray as any;
  set(current, updated);
}

/**
 * @description: 添加丹方
 * @param {string} id
 * @return {*}
 */
function AddDanFang(id: string) {
  const { current } = useStore.getState();
  const acData = getActor();
  const { set } = useActorStore.getState();
  if (acData.danfang.some((v) => v.id === id)) {
    return;
  }
  const updated = cloneDeep(acData);
  updated.danfang.push({ id, exp: 0 });
  set(current, updated);
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
  // eslint-disable-next-line no-underscore-dangle
  const _num = lsData.num ? lsData.num : 1;
  return _num >= num;
}

export default {
  Add,
  AddDanFang,
  Has,
  HasArr,
  Get,
  Remove,
  RemoveArr,
  getActor,
  TR,
  LingShiThan
};
