export enum CWType {
  FB, // 法宝
  DY, //丹药
  QT, // 其他
}

// 工具类型：生成嵌套路径的联合类型（如 "a" | "a.b" | "a.b.c"）
export type NestedKeyOf<Obj> = Obj extends object
  ? {
      [K in keyof Obj & string]: `${K}` | `${K}.${NestedKeyOf<Obj[K]>}`;
    }[keyof Obj & string]
  : never;

/**
 * @description: 基础储物类型
 * @return {*}
 */
export interface BaseType {
  name: string; // 名称
  isPile: boolean; // 可堆叠
  desc?: string; //描述
  num?: number;
}
export interface FBType extends BaseType {
  type: CWType.FB;
}
export interface DYType extends BaseType {
  type: CWType.DY;
}
export interface QTType extends BaseType {
  type: CWType.QT;
}

export interface CuWuType {
  fb: FBType[]; // 法宝
  dy: DYType[]; // 丹药
  qt: QTType[]; // 其他
  max: number; //容量
}

/**
 * @description:战斗属性
 * @return {*}
 */
export interface ActorDataConfigForZhanDou {
  qixue: number; // 气血
  fangyu: number; // 防御
  baoji: number; // 暴击
  fashu: number; // 法术
  gongji: number; // 攻击
  sudu: number; // 速度
}

/**
 * @description: 角色属性
 * @return {*}
 */
export interface ActorDataConfig extends ActorDataConfigForZhanDou {
  uuid: string; // 唯一id
  daohao: string; // 道号
  linggen: string; // 灵根
  jingjie: string; // 境界
  max_jingjie: string;
  xiuwei: number; // 修为
  max_xiuwei: number;
  shenshi: number; // 神识
  max_shenshi: number;
  shouyuan: number; // 寿元
  max_shouyuan: number;
  zhongzu: string; // 种族
  lv: number; //等级
  xuanyuan: number; // 仙缘
  xiulianbeilv: number; // 修炼倍率
  cw: CuWuType;
  time1: number; // 时间1
  shenshiTime: number; // 神识计算
  qiandao: {
    count: number; // 累计
    last: string; // 最后一次签到
    time: string; // 当前时间对比
  };
  xiulian: null | {
    time: number;
  }; //修炼
  dongfu: null | {
    lv: number;
    lingchi: number; // 灵池
  }; // 洞府
}
