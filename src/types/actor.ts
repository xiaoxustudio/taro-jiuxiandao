import type { FangshiSnapshot } from '@/utils/fangshi';
import type { MaterialPoolByGrade, SeedRegistryItem } from '@/assets/const';
import { DAOLV_QUALITIES } from '@/config';
import { CuWuType, FabaoType, FBItemType } from './chuwu';
import { GongFaType } from './gongfa';
import { AchievementData } from './chengjiu';

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

export type DaoLvQuality = (typeof DAOLV_QUALITIES)[number];

// 道侣
export type DaoLvCandidate = {
  name: string;
  quality: DaoLvQuality;
  affinity: number;
  jingjie?: string;
  jingjie1?: string;
  jingjie2?: string;
  attr: Partial<ActorDataConfigForZhanDou>;
};

// 道侣列表
export type DaoLvMarket = {
  date: string;
  refreshCount: number;
  candidates: DaoLvCandidate[];
};

// 洞府数据
export type DongfuData = {
  lv: number;
  lingchi: number;
  daolv: DaoLvCandidate | null;
  daolvMarket?: DaoLvMarket | null; // 道侣市场
  shuangxiu?: { date: string } | null; // 双修
};

export type YaoyuanSeed = SeedRegistryItem & {
  num: number;
};

// 药园灵田
export type YaoyuanPlot = {
  id: number;
  lv: number;
  unlocked: boolean;
  seed: (SeedRegistryItem & { plantTime: number }) | null;
};

// 药园数据
export type YaoyuanData = {
  lv: number;
  plots: YaoyuanPlot[]; // 已种植的灵田
  seeds: YaoyuanSeed[];
};
export type ActorDataConfigForFaBao = {
  [K in keyof typeof FabaoType]: null | undefined | FBItemType;
};

// 重生保留配置
export type RebirthKeepConfig = {
  keepLinggen?: boolean; // 保留灵根
  keepZhongzu?: boolean; // 保留种族
  keepShouyuan?: number; // 保留寿元百分比（0-100）
  keepXiuwei?: number; // 保留修为百分比（0-100）
  keepFabao?: boolean; // 保留法宝
  keepGongfa?: boolean; // 保留功法
  keepCailiao?: number; // 保留材料数量上限
};

// 重生奖励
export type RebirthReward = {
  type: 'xianyuan' | 'shenshi';
  value: number;
};

export interface LingShouData {
  name: string;
  lv: number;
  exp: number;
  maxExp: number;
  gongji: number;
  fangyu: number;
  qixue: number;
  active: boolean;
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
  jingjie1: string; // 小境界
  jingjie2: string; // 阶段境界
  xiuwei: number; // 修为
  max_xiuwei: number; // 修为上限
  shenshi: number; // 神识
  max_shenshi: number; // 神识上限
  shouyuan: number; // 寿元
  max_shouyuan: number; // 寿元上限
  zhongzu: string; // 种族
  lv: number; // 等级
  xianyuan: number; // 仙缘
  xiulianbeilv: number; // 修炼倍率
  cw: CuWuType; // 储物
  time1: number; // 时间1
  xiuxianStartAt: number;
  xiuxianTimeScale: number;
  shenshiTime: number; // 神识计算
  fabao: ActorDataConfigForFaBao; // 法宝
  addAttr: ActorDataConfigForZhanDou; // 加成属性（功法，法宝等）
  qiandao: {
    count: number; // 累计
    last: string; // 最后一次签到
    time: string; // 当前时间对比
    streak: number; // 连续签到天数
  };
  zd: {
    time: number; // 挂机时间
    df: string; // 地方
  };
  xiulian: null | {
    time: number; // 修炼开始时间
  }; // 修炼
  dongfu: DongfuData | null; // 洞府
  liandan: {
    time: number; // 炼丹开始时间
    completeTime: number; // 炼丹预计完成时间戳
    chenghao: string; // 炼丹称号
    danyun: number; // 丹韵
    exp: number; // 炼丹经验
    max_exp: number; // 炼丹经验上限
    danlu: { name: number; lv: number } | null; // 丹炉
    danyao: { id: number; num: number } | null; // 当前炼制丹药
  }; // 炼丹
  danfang: { id: string; exp: number }[]; // 已学习丹方列表
  gongfa: {
    ls: GongFaType[]; // 已拥有功法
    current: GongFaType | null; // 当前功法
  }; // 功法列表
  fangshi?: FangshiSnapshot; // 坊市快照
  danfangData?: Record<string, any>; // 丹方原始数据缓存
  materialRegistry?: { name: string; itype: string }[]; // 材料注册表
  seedRegistry?: SeedRegistryItem[]; // 种子注册表
  yaoyuan?: YaoyuanData; // 药园数据
  materialPoolByGrade?: MaterialPoolByGrade; // 材料池（按品阶）
  danfangPoolByGrade?: Record<string, any[]>; // 丹方池（按品阶）
  gongfaPoolByGrade?: Record<string, GongFaType[]>; // 功法池（按品阶）
  materialPoolStorageKey?: string; // 材料池存储 key
  materialPoolStorageKeysByGrade?: Record<string, string>; // 材料池分品阶存储 key
  danfangPoolStorageKey?: string; // 丹方池存储 key
  danfangPoolStorageKeysByGrade?: Record<string, string>; // 丹方池分品阶存储 key
  lingShou?: LingShouData; // 灵兽
  gongfaPoolStorageKeysByGrade?: Record<string, string>; // 功法池分品阶存储 key
  danfangDataStorageKey?: string; // 丹方数据存储 key
  seedRegistryStorageKey?: string; // 种子注册表存储 key
  chengjiu?: AchievementData; // 成就数据
  battleCount?: number; // 战斗次数
  winStreak?: number; // 连胜次数
  rebirthReward?: RebirthReward[]; // 重生奖励
  rebirthKeepConfig?: RebirthKeepConfig; // 重生保留配置
  lunhuiCount?: number; // 轮回次数
}
