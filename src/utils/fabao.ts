import { cloneDeep } from 'lodash-es';
/* 法宝相关操作 */

import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { CWType, FabaoType, FBItemType } from '@/types';
import { AutoMapObject } from '.';
import { getActor } from './actor';
import chuwu from './chuwu';

// 自动生成映射
const FaBaoTypeMap = AutoMapObject(FabaoType);

/**
 * @description: 类型转换为中文
 * @param {FabaoType} type 位置类型
 * @return {*}
 */
function FaBaoTypeTransform(type: FabaoType): string {
  const result = FaBaoTypeMap[type];
  if (!result) {
    throw new Error('未知的法宝类型');
  }
  return result;
}

/**
 * @description: 获取指定位置的法宝
 * @param {FabaoType} type
 * @return {*}
 */
function getFaBao(type: FabaoType) {
  const actor = getActor();
  const target = actor.fabao?.[FaBaoTypeTransform(type)];
  return target || null;
}

/**
 * @description: 穿戴法宝
 * @param {number} index 法宝在背包位置索引
 * @return {*}
 */
function WearFaBao(index: number) {
  const { current } = useStore.getState();
  const { set } = useActorStore.getState();
  const actor = getActor();
  const { fb } = actor.cw;
  if (index < 0 || index >= fb.length) {
    throw new Error('超出索引范围');
  }
  const fbObj = cloneDeep(fb[index] as FBItemType);
  const slotName =
    typeof fbObj.itype === 'number'
      ? FaBaoTypeTransform(fbObj.itype)
      : fbObj.itype;
  if (!slotName) {
    throw new Error(`未知的法宝类型: ${fbObj.itype}`);
  }
  const updated = cloneDeep(actor);
  if (!updated.fabao[slotName]) {
    updated.fabao[slotName] = null;
  }
  updated.fabao[slotName] = fbObj;
  const keys = Object.keys(fbObj.attr || {});
  for (const k of keys) {
    updated.addAttr[k] = (updated.addAttr[k] || 0) + (fbObj.attr[k] || 0);
  }
  set(current, updated);
  chuwu.Remove({ name: fbObj.name, type: CWType.FB, num: 1 });
}

/**
 * @description: 卸下法宝
 * @param {FabaoType} type 位置类型
 * @return {*}
 */
function TakeOffFaBao(type: FabaoType) {
  const typeZh = FaBaoTypeTransform(type);
  const { current } = useStore.getState();
  const { set } = useActorStore.getState();
  const actor = getActor();
  const fabaoData = actor.fabao;
  if (!fabaoData[typeZh]) return;
  const fbObj = cloneDeep(fabaoData[typeZh]);
  const updated = cloneDeep(actor);
  updated.fabao[typeZh] = null;
  const keys = Object.keys(fbObj.attr || {});
  for (const k of keys) {
    updated.addAttr[k] = (updated.addAttr[k] || 0) - (fbObj.attr[k] || 0);
  }
  set(current, updated);
  chuwu.Add(fbObj);
}

export { FaBaoTypeTransform, getFaBao, TakeOffFaBao, WearFaBao };
