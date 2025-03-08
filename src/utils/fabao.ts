/* 法宝相关操作 */

import { FabaoType } from '@/types';
import { getActor } from './actor';

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
const FaBaoTypeMap: Record<FabaoType, string> = Object.values(FabaoType).reduce(
  (acc, key) => {
    if (typeof key === 'string') {
      acc[FabaoType[key]] = key;
    }
    return acc;
  },
  {} as Record<FabaoType, string>
);

// 类型转换为中文
function FaBaoTypeTransform(type: FabaoType): string {
  const result = FaBaoTypeMap[type];
  if (!result) {
    throw new Error('未知的法宝类型');
  }
  return result;
}

export { FaBaoTypeTransform, getFaBao };

