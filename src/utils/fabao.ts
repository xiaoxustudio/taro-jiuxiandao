import { cloneDeep } from 'lodash-es';
/* 法宝相关操作 */

import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { CWType, FabaoType, FBItemType } from '@/types';
import { ActorDataConfigForZhanDou, AddAttrType } from '@/types/actor';
import { getActor } from './actor';
import chuwu from './chuwu';

/**
 * @description: 获取指定位置的法宝
 * @param {FabaoType} type
 * @return {*}
 */
function getFaBao(type: FabaoType) {
  const actor = getActor();
  const target = actor.fabao?.[type];
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
  const fbObj = cloneDeep(fb[index]) as FBItemType;
  if (!fbObj) {
    throw new Error('法宝对象为空');
  }
  const slotName = fbObj.itype;
  if (!slotName) {
    throw new Error(`未知的法宝类型: ${fbObj.itype}`);
  }
  const updated = cloneDeep(actor);
  const oldFB = updated.fabao[slotName];
  if (oldFB) {
    const oldKeys = Object.keys(oldFB.attr || {}).filter(
      (k) => k !== 'xianyuan'
    ) as (keyof ActorDataConfigForZhanDou)[];
    for (const k of oldKeys) {
      const attrKey = k as keyof AddAttrType;
      updated.addAttr[attrKey] =
        (updated.addAttr[attrKey] || 0) - (oldFB.attr[k] || 0);
    }
  }
  updated.fabao[slotName] = fbObj;
  const keys = Object.keys(fbObj.attr || {}).filter(
    (k) => k !== 'xianyuan'
  ) as (keyof ActorDataConfigForZhanDou)[];
  for (const k of keys) {
    const attrKey = k as keyof AddAttrType;
    updated.addAttr[attrKey] =
      (updated.addAttr[attrKey] || 0) + (fbObj.attr[k] || 0);
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
  const { current } = useStore.getState();
  const { set } = useActorStore.getState();
  const actor = getActor();
  const fabaoData = actor.fabao;
  const slotKey = type;
  if (!fabaoData[slotKey]) return;
  const fbObj = cloneDeep(fabaoData[slotKey]) as FBItemType;
  const updated = cloneDeep(actor);
  updated.fabao[slotKey] = null;
  const keys = Object.keys(fbObj.attr || {}).filter(
    (k) => k !== 'xianyuan'
  ) as (keyof ActorDataConfigForZhanDou)[];
  for (const k of keys) {
    const attrKey = k as keyof AddAttrType;
    updated.addAttr[attrKey] =
      (updated.addAttr[attrKey] || 0) - (fbObj.attr[k] || 0);
  }
  set(current, updated);
  chuwu.Add(fbObj);
}

export { getFaBao, TakeOffFaBao, WearFaBao };
