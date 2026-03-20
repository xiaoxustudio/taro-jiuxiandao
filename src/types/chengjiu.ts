/**
 * 成就类型定义
 */

// 成就状态
export type AchievementStatus = 'locked' | 'completed' | 'claimed';

// 成就分类
export type AchievementCategory =
  | 'cultivation' // 修炼类
  | 'battle' // 战斗类
  | 'collection' // 收集类
  | 'social' // 社交类
  | 'exploration' // 探索类
  | 'special'; // 特殊类

// 成就类型
export type AchievementType =
  | 'level' // 等级达成
  | 'realm' // 境界突破
  | 'count' // 数量累计
  | 'special' // 特殊事件
  | 'continuous'; // 连续达成

// 成就条件
export interface AchievementCondition {
  type: AchievementType;
  target: number | string; // 目标值
  field?: string; // 需要检查的字段
  operator?: '>' | '>=' | '=' | '<' | '<='; // 比较操作符
}

// 成就奖励
export interface AchievementReward {
  type:
    | 'lingqi'
    | 'lingqi_rate'
    | 'shenshi'
    | 'shouyuan'
    | 'xiuwei'
    | 'special';
  value: number | string;
  desc?: string;
}

// 成就项
export interface AchievementItem {
  id: string;
  name: string;
  desc: string;
  category: AchievementCategory;
  status: AchievementStatus;
  progress: number; // 当前进度
  target: number; // 目标进度
  condition: AchievementCondition;
  reward: AchievementReward[];
  points: number; // 成就点数
  completedAt?: number; // 完成时间
  claimedAt?: number; // 领取时间
}

// 成就数据
export interface AchievementData {
  achievements: Record<string, AchievementItem>; // 所有成就
  claimedIds: string[]; // 已领取的成就ID
  totalPoints: number; // 总成就点数
  claimedPoints: number; // 已领取的成就点数
}

// 成就进度记录
export interface AchievementProgress {
  [key: string]: number | string | boolean;
}
