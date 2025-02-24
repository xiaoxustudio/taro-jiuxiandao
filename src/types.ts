export enum CWType {
  WP,
  CL,
  DJ,
}
/**
 * @description: 基础储物类型
 * @return {*}
 */
export interface BaseType {
  name: string; // 名称
  isPile: boolean; // 可堆叠
  desc?: string; //描述
  num: number;
}
export interface WPType extends BaseType {
  type: CWType.WP;
}
export interface CLType extends BaseType {
  type: CWType.CL;
}
export interface DJType extends BaseType {
  type: CWType.DJ;
}

export interface CuWuType {
  wp: WPType[]; // 物品
  cl: CLType[]; // 材料
  dj: DJType[]; // 道具
  max: number; //容量
}
export interface ActorDataConfig {
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
  qixue: number; // 气血
  fangyu: number; // 防御
  baoji: number; // 暴击
  fashu: number; // 法术
  zhongzu: string; // 种族
  lv: number; //等级
  xuanyuan: number; // 仙缘
  xiulianbeilv: number; // 修炼倍率
  gongji: number; // 攻击
  sudu: number; // 速度
  cw: CuWuType;
  time1: number; // 时间1
  xiulian: {
    time: number;
  };
}
