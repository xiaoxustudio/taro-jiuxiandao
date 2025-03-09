/* 法宝相关操作 */

import { FabaoType } from '@/types';
import { AutoMapObject } from '.';
import { getActor } from './actor';
import ErrorController, { ErrorTypeCode } from './ErrorManager';

const FBError = new ErrorController(ErrorTypeCode.法宝错误);

/**
 * @description: 获取指定位置的法宝
 * @param {FabaoType} type
 * @return {*}
 */
function getFaBao(type: FabaoType) {
  const actor = getActor();
  const target = actor.fabao?.[type];
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
  const actor = getActor();
  const { fb } = actor.cw;
  const len = fb.length;
  if (index > len - 1) {
    FBError.emitError('超出索引范围');
  }
}

export { FaBaoTypeTransform, FBError, getFaBao, WearFaBao };
