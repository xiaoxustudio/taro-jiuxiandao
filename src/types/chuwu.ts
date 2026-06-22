import { ActorDataConfigForZhanDou } from './actor';

export enum CWType {
  FB, // 法宝
  DY, // 丹药
  QT // 其他
}

export enum FabaoType {
  手持武器 = '手持武器',
  头戴战盔 = '头戴战盔',
  身穿战甲 = '身穿战甲',
  腰带护具 = '腰带护具',
  饰品加持 = '饰品加持',
  鞋子护腿 = '鞋子护腿',
  魂器镇魂 = '魂器镇魂',
  本名法宝 = '本名法宝'
}

// 法宝品级
export enum FabaoPinjie {
  练气 = '法器',
  筑基 = '灵器',
  结丹 = '法宝',
  元婴 = '古宝',
  化神 = '灵宝',
  返虚 = '后天灵宝',
  合体 = '先天灵宝',
  大乘 = '通天灵宝'
}

// 工具类型：生成嵌套路径的联合类型（支持 2 层嵌套）
type NestedKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | (T[K] extends object ? NestedKeys<T[K], `${Prefix}${K}.`> : never);
    }[keyof T & string]
  : never;

export type NestedKeyOf<Obj extends object> = NestedKeys<Obj>;

/**
 * @description: 基础储物类型
 * @return {*}
 */
export interface BaseType {
  name: string; // 名称
  isPile?: boolean; // 可堆叠
  desc?: string; // 描述
  type: CWType; // 类型
  num?: number;
}

export interface FBItemType extends BaseType {
  type: CWType.FB;
  attr: Partial<ActorDataConfigForZhanDou>; // 属性
  itype: FabaoType; // 法宝类型
  pj: string; // 法宝品级
  lv: number; // 强化等级
}
export interface DYItemType extends BaseType {
  type: CWType.DY;
  itype?: string; // 丹药品阶（运行时生成）
}
export interface QTItemType extends BaseType {
  type: CWType.QT;
}

export interface CuWuType {
  fb: FBItemType[]; // 法宝
  dy: DYItemType[]; // 丹药
  qt: QTItemType[]; // 其他
  max: number; // 容量
}
