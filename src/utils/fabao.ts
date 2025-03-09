/* 法宝相关操作 */

import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { CWType, FabaoType, FBItemType } from '@/types';
import { AutoMapObject } from '.';
import { getActor } from './actor';
import chuwu from './chuwu';
import ErrorController, { ErrorTypeCode } from './ErrorManager';

const FBError = new ErrorController(ErrorTypeCode.法宝错误);

/**
 * @description: 获取指定位置的法宝
 * @param {FabaoType} type
 * @return {*}
 */
function getFaBao(type: FabaoType) {
  const actor = getActor();
  const target = actor.fabao?.[FaBaoTypeTransform(type)];
  return target ? target : null;
}

// 自动生成映射
const FaBaoTypeMap = AutoMapObject(FabaoType);

// 类型转换为中文
function FaBaoTypeTransform(type: FabaoType): string {
  const result = FaBaoTypeMap[type];
  if (!result) {
    throw new Error('未知的法宝类型');
  }
  return result;
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
  const len = fb.length;
  if (index > len - 1) {
    throw new Error('超出索引范围');
  }
  const fbObj = fb[index] as FBItemType;
  const slotName =
    typeof fbObj.itype === 'number'
      ? FaBaoTypeTransform(fbObj.itype)
      : fbObj.itype;
  if (!slotName)
    Object.defineProperty(actor.fabao, slotName, {
      value: null,
      configurable: true,
      enumerable: true,
    });
  actor.fabao[slotName] = fbObj;
  // addAttr 修改
  const keys = Object.keys(fbObj.attr);
  for (const k of keys) {
    if (typeof actor.addAttr[k] === 'number') {
      actor.addAttr[k] = actor.addAttr[k] + fbObj.attr[k];
    }
  }
  // 设置数据
  set(current, actor);
  chuwu.Remove({ name: fbObj.name, type: CWType.FB, num: 1 });
}

export { FaBaoTypeTransform, FBError, getFaBao, WearFaBao };

