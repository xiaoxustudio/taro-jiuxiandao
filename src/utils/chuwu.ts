import cloneDeep from 'lodash-es/cloneDeep';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import {
  ActorDataConfigForZhanDou,
  BaseType,
  CWType,
  DYItemType,
  FBItemType,
  QTItemType
} from '@/types';
import danfangData from '@/assets/danfang.json';
import type { DanfangData } from '@/types/danfang';
import { getActor } from './actor';
/* 角色储物相关操作 */

export interface AddProps {
  name: string;
  type: CWType;
  num?: number;
  isPile?: boolean;
  desc?: string;
  attr?: Partial<ActorDataConfigForZhanDou>;
  itype?: string;
  pj?: string;
  lv?: number;
}

type CwArray = FBItemType[] & DYItemType[] & QTItemType[];

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
function TR(type: CWType): 'fb' | 'dy' | 'qt' {
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
function Has({ name, type = CWType.FB }: OperaterType): number {
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
function Get({ name, type = CWType.FB }: OperaterType): BaseType | undefined {
  const acData = getActor();
  const cw = acData.cw[TR(type)];
  return cw.find((v: BaseType) => v.name === name);
}

/**
 * @description: 移除该物品
 * @param {object} param1
 * @return {*}
 */
function Remove(item: OperaterType): void {
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
    updated.cw[typeKey] = cwArray.filter(
      (_, i) => i !== existingIndex
    ) as CwArray;
  } else {
    updated.cw[typeKey] = cwArray.map((v, i) =>
      i === existingIndex ? { ...v, num: lessNum } : v
    ) as CwArray;
  }
  set(current, updated);
}

/**
 * @description: 删除物品数组
 * @param {OperaterType[]} items
 * @return {*}
 */
function RemoveArr(items: OperaterType[]): void {
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
}: AddProps): boolean {
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
    const totalSlots =
      updated.cw.fb.length + updated.cw.dy.length + updated.cw.qt.length;
    if (totalSlots >= (updated.cw.max || 30)) {
      return false;
    }
    cwArray.push(baseObject);
  }
  updated.cw[typeKey] = cwArray as CwArray;
  set(current, updated);
  return true;
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
 * @description: 使用丹药
 * @param {string} name
 * @return {boolean}
 */
function UsePill(name: string): boolean {
  // 统一丹药效果查找链：danfang.json → danfangData缓存 → 储物attr
  const entry = Object.values(danfangData).find(
    (v) => v.name === name && v.attr
  );
  let attr: Record<string, number> | undefined;
  if (entry?.attr) {
    attr = entry.attr;
  }
  // 如果静态数据没找到，尝试从角色的丹方缓存中查找
  if (!attr) {
    const acData = getActor();
    const danfangDataCache = acData.danfangData;
    if (danfangDataCache) {
      const cachedEntry = Object.values(danfangDataCache as DanfangData).find(
        (v) => v.name === name && v.attr
      );
      if (cachedEntry?.attr) {
        attr = cachedEntry.attr;
      }
    }
  }
  // 最后从储物中的丹药本身查找
  if (!attr) {
    const item = Get({ name, type: CWType.DY });
    if (item && 'attr' in item && item.attr) {
      attr = item.attr as Record<string, number>;
    }
  }
  if (!attr) return false;
  const { current } = useStore.getState();
  const acData = getActor();
  const { set } = useActorStore.getState();
  const updated = cloneDeep(acData);
  Object.entries(attr).forEach(([key, val]) => {
    if (key === 'shouyuan') {
      const oldMax = updated.max_shouyuan || 100;
      updated.max_shouyuan = oldMax + val;
      updated.shouyuan = Math.min(updated.shouyuan || 0, updated.max_shouyuan);
    } else if (key === 'shenshi') {
      const maxShenshi = updated.max_shenshi || 100;
      updated.shenshi = Math.min((updated.shenshi || 0) + val, maxShenshi);
    } else {
      const currentVal = (updated as unknown as Record<string, unknown>)[key];
      if (typeof currentVal === 'number') {
        (updated as unknown as Record<string, unknown>)[key] = currentVal + val;
      }
    }
  });
  const typeKey = TR(CWType.DY);
  const cwArray = updated.cw[typeKey] as BaseType[];
  const idx = cwArray.findIndex((v) => v.name === name);
  if (idx !== -1) {
    const item = cwArray[idx];
    const newNum = (item.num || 1) - 1;
    if (newNum <= 0) {
      updated.cw[typeKey] = cwArray.filter((_, i) => i !== idx) as CwArray;
    } else {
      updated.cw[typeKey] = cwArray.map((v, i) =>
        i === idx ? { ...v, num: newNum } : v
      ) as CwArray;
    }
  }
  set(current, updated);
  return true;
}

export function getLingshi(): number {
  return Get({ name: '灵石', type: CWType.QT })?.num || 0;
}

export function payLingshi(num: number): boolean {
  if (getLingshi() < num) return false;
  Remove({ name: '灵石', type: CWType.QT, num });
  return true;
}

export function consumeShengLingShi(): boolean {
  if (!Get({ name: '升灵石', type: CWType.QT })?.num) return false;
  Remove({ name: '升灵石', type: CWType.QT, num: 1 });
  return true;
}

export function sellItem(name: string, type: CWType, sellPrice: number): void {
  const owned = Get({ name, type });
  if (!owned) return;
  const num = owned.num ?? 1;
  Remove({ name, type, num });
  Add({
    name: '灵石',
    type: CWType.QT,
    isPile: true,
    num: sellPrice * num
  });
}

export default {
  Add,
  AddDanFang,
  Has,
  HasArr,
  Get,
  Remove,
  RemoveArr,
  UsePill,
  getActor,
  TR,
  getLingshi,
  payLingshi,
  consumeShengLingShi,
  sellItem
};
