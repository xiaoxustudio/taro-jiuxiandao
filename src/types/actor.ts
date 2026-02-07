import type { FangshiSnapshot } from '@/utils/fangshi';
import type { MaterialPoolByGrade, SeedRegistryItem } from '@/assets/const';
import { DAOLV_QUALITIES } from '@/consts';
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

export type SectRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 宗门品阶

export type SectRole =
  | '宗主'
  | '长老'
  | '亲传弟子'
  | '内门弟子'
  | '外门弟子'
  | '杂役'; // 宗门职位

export type SectMember = {
  id: string; // 成员唯一标识
  name: string; // 成员姓名
  role: SectRole; // 职位
  relation: string; // 关系称谓
  intimacy: number; // 亲密度
  jingjie: string; // 大境界
  jingjie1: string; // 小境界
  jingjie2: string; // 阶段境界
  attr: Partial<ActorDataConfigForZhanDou>; // 战斗属性
  joinDay: number; // 入宗日
  cw: CuWuType; // 储物袋
};

export type SectElderSeat = {
  seat: number; // 席位编号
  memberId: string | null; // 占位成员
};

export type SectLog = {
  day: number; // 发生日
  text: string; // 日志内容
};

export type SectBuildingStatus = '正常' | '修缮中' | '受损' | '未建';

export type SectBuildingKey = '藏经阁' | '灵池' | '大门' | '演武场' | '丹房';

export type SectBuilding = {
  id: string;
  name: SectBuildingKey;
  level: number;
  status: SectBuildingStatus;
  desc: string;
  effect: string;
  unlockRank?: SectRank;
};

export type Sect = {
  id: string; // 宗门唯一标识
  name: string; // 宗门名称
  rank: SectRank; // 品阶
  capacity: number; // 容纳人数
  elders: SectElderSeat[]; // 长老席位
  members: SectMember[]; // 成员列表
  logs: SectLog[]; // 宗门日志
  buildings?: SectBuilding[]; // 宗门建筑
  lastEventDay: number; // 最近一次事件日
  reputation?: number; // 宗门声望（0-100）
  injuryRecoveryUntilDay?: number; // 战损后养伤结束日
  warMeritDays?: number; // 战功奖励持续天数
  revengeLevel?: number; // 外敌复仇链强度等级
  revengeNextDay?: number; // 外敌下次来袭日
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
  max_xiuwei: number; // 修为上限
  shenshi: number; // 神识
  max_shenshi: number; // 神识上限
  shouyuan: number; // 寿元
  max_shouyuan: number; // 寿元上限
  zhongzu: string; // 种族
  lv: number; // 等级
  xuanyuan: number; // 仙缘
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
  gongfaPoolStorageKeysByGrade?: Record<string, string>; // 功法池分品阶存储 key
  danfangDataStorageKey?: string; // 丹方数据存储 key
  seedRegistryStorageKey?: string; // 种子注册表存储 key
  menpai?: {
    sects: Sect[];
    joinedSectId?: string;
  };
}
