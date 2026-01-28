import type { FangshiSnapshot } from '@/utils/fangshi';
import type { MaterialPoolByGrade } from '@/assets/const';
import { CuWuType, FabaoType, FBItemType } from './chuwu';
import { GongFaType } from './gongfa';

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
  xianyuan: number; // 仙缘
}
export type ActorDataConfigForFaBao = {
  [K in keyof typeof FabaoType]: null | undefined | FBItemType;
};

/**
 * @description: 角色属性
 * @return {*}
 */
export interface ActorDataConfig extends ActorDataConfigForZhanDou {
  uuid: string; // 唯一id
  daohao: string; // 道号
  linggen: string; // 灵根
  jingjie: string; // 境界
  jingjie1: string; // 小境界
  jingjie2: string; // 阶段境界
  xiuwei: number; // 修为
  max_xiuwei: number;
  shenshi: number; // 神识
  max_shenshi: number;
  shouyuan: number; // 寿元
  max_shouyuan: number;
  zhongzu: string; // 种族
  lv: number; // 等级
  xuanyuan: number; // 仙缘
  xiulianbeilv: number; // 修炼倍率
  cw: CuWuType;
  time1: number; // 时间1
  shenshiTime: number; // 神识计算
  fabao: ActorDataConfigForFaBao; // 法宝
  addAttr: ActorDataConfigForZhanDou; // 加成属性（功法，法宝等）
  qiandao: {
    count: number; // 累计
    last: string; // 最后一次签到
    time: string; // 当前时间对比
  };
  zd: {
    time: number; // 挂机时间
    df: string; // 地方
  };
  xiulian: null | {
    time: number;
  }; // 修炼
  dongfu: null | {
    lv: number;
    lingchi: number; // 灵池
    daolv: null | {
      affinity: number;
    };
  }; // 洞府
  liandan: {
    time: number;
    chenghao: string;
    danyun: number;
    exp: number;
    max_exp: number;
    danlu: { name: number; lv: number } | null;
    danyao: { id: number; num: number } | null;
  }; // 炼丹
  danfang: { id: string; exp: number }[]; // 已学习丹方列表
  gongfa: {
    ls: GongFaType[];
    current: GongFaType | null;
  }; // 功法列表
  fangshi?: FangshiSnapshot;
  danfangData?: Record<string, any>;
  materialRegistry?: { name: string; itype: string }[];
  materialPoolByGrade?: MaterialPoolByGrade;
  danfangPoolByGrade?: Record<string, any[]>;
  materialPoolStorageKey?: string;
  materialPoolStorageKeysByGrade?: Record<string, string>;
  danfangPoolStorageKey?: string;
  danfangPoolStorageKeysByGrade?: Record<string, string>;
  danfangDataStorageKey?: string;
}
