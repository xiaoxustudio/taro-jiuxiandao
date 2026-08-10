import cloneDeep from 'lodash-es/cloneDeep';
import achievementConfig from '@/assets/chengjiu.json';
import { REALM_ORDER } from '@/assets/const';
import type { ActorDataConfig } from '@/types';
import {
  AchievementItem,
  AchievementCategory,
  AchievementData,
  AchievementCondition,
  AchievementReward
} from '@/types/chengjiu';

export interface AchievementProgress {
  battleCount?: number;
  winStreak?: number;
  gongfaCount?: number;
  fabaoCount?: number;
  danfangCount?: number;
  qiandaoStreak?: number;
  shilianCount?: number;
  shilianPlaceCount?: number;
  lunhuiCount?: number;
  lingshouLv?: number;
  yaoyuanPlots?: number;
  daolvCount?: number;
  danweiTitleIndex?: number;
  [key: string]: number | undefined;
}

export interface RewardItem {
  type: AchievementReward['type'];
  value: number | string;
  desc?: string;
}

// 成就分类映射
export const ACHIEVEMENT_CATEGORY_MAP: Record<AchievementCategory, string> = {
  cultivation: '修炼',
  battle: '战斗',
  collection: '收集',
  social: '社交',
  exploration: '探索',
  special: '特殊'
};

// 初始化成就数据
export const initAchievements = (): AchievementData => {
  const achievements: Record<string, AchievementItem> = {};

  const configList = Object.values(
    achievementConfig.achievements
  ) as unknown as AchievementItem[];

  configList.forEach((config) => {
    achievements[config.id] = {
      ...config,
      status: 'locked',
      progress: 0,
      target:
        typeof config.condition.target === 'number'
          ? config.condition.target
          : 1,
      reward: config.reward || []
    };
  });

  // 计算所有成就点数的总和
  const totalPoints = Object.values(achievements).reduce(
    (sum, achievement) => sum + (achievement.points || 0),
    0
  );

  return {
    achievements,
    claimedIds: [],
    totalPoints,
    claimedPoints: 0
  };
};

// 检查成就条件
export const checkCondition = (
  condition: AchievementCondition,
  actor: Partial<ActorDataConfig> | null | undefined,
  progress: AchievementProgress
): boolean => {
  const { type, target, field, operator = '>=' } = condition;

  let currentValue: number | string;

  switch (type) {
    case 'level':
      currentValue = actor?.lv || 0;
      break;
    case 'realm': {
      const raw =
        actor && field ? (actor as Record<string, unknown>)[field] : undefined;
      currentValue = typeof raw === 'string' ? raw : '';
      if (typeof currentValue === 'string') {
        const currentIndex = REALM_ORDER.indexOf(currentValue);
        const targetIndex = REALM_ORDER.indexOf(target as string);
        return currentIndex >= targetIndex;
      }
      return false;
    }
    case 'count':
    case 'continuous':
      currentValue = field ? progress[field] || 0 : 0;
      break;
    default:
      return false;
  }

  if (typeof currentValue === 'number' && typeof target === 'number') {
    switch (operator) {
      case '>':
        return currentValue > target;
      case '>=':
        return currentValue >= target;
      case '<':
        return currentValue < target;
      case '<=':
        return currentValue <= target;
      case '=':
        return currentValue === target;
      default:
        return currentValue >= target;
    }
  }

  return false;
};

// 更新成就进度
export const updateAchievementProgress = (
  achievementData: AchievementData,
  actor: Partial<ActorDataConfig> | null | undefined,
  progress: AchievementProgress
): AchievementData => {
  const updatedData = cloneDeep(achievementData);

  Object.values(updatedData.achievements).forEach((achievement) => {
    const isCompleted = checkCondition(achievement.condition, actor, progress);

    if (
      isCompleted &&
      achievement.status !== 'completed' &&
      achievement.status !== 'claimed'
    ) {
      achievement.status = 'completed';
      achievement.completedAt = Date.now();
    }
    if (
      achievement.condition.field &&
      progress[achievement.condition.field] !== undefined
    ) {
      achievement.progress = progress[achievement.condition.field] as number;
    } else if (achievement.condition.type === 'level') {
      achievement.progress = actor?.lv || 0;
    } else if (achievement.condition.type === 'realm') {
      const currentIndex = REALM_ORDER.indexOf(actor?.jingjie || '');
      const targetIndex = REALM_ORDER.indexOf(
        achievement.condition.target as string
      );
      achievement.progress =
        currentIndex >= 0 && currentIndex >= targetIndex ? 1 : 0;
    }
  });
  return updatedData;
};

// 领取成就奖励
export const claimAchievementReward = (
  achievementData: AchievementData,
  achievementId: string
): { success: boolean; rewards?: RewardItem[]; error?: string } => {
  const achievement = achievementData.achievements[achievementId];

  if (!achievement) {
    return { success: false, error: '成就不存在' };
  }

  if (achievement.status !== 'completed') {
    return { success: false, error: '成就未完成' };
  }

  if (achievementData.claimedIds.includes(achievementId)) {
    return { success: false, error: '奖励已领取' };
  }

  const updatedData = cloneDeep(achievementData);
  updatedData.claimedIds.push(achievementId);
  updatedData.claimedPoints += achievement.points || 0;
  updatedData.achievements[achievementId].status = 'claimed';
  updatedData.achievements[achievementId].claimedAt = Date.now();

  return {
    success: true,
    rewards: achievement.reward
  };
};

// 获取成就列表（按分类）
export const getAchievementsByCategory = (
  achievementData: AchievementData,
  category?: AchievementCategory
): AchievementItem[] => {
  const achievements = Object.values(achievementData.achievements);

  if (category) {
    return achievements.filter((a) => a.category === category);
  }

  return achievements;
};

// 获取未领取的成就
export const getUnclaimedAchievements = (
  achievementData: AchievementData
): AchievementItem[] => {
  return Object.values(achievementData.achievements).filter(
    (a) =>
      a.status === 'completed' && !achievementData.claimedIds.includes(a.id)
  );
};

// 应用成就奖励
export const applyAchievementReward = (
  reward: RewardItem,
  set: (key: string, v: unknown) => void,
  get: (key: string) => number
): void => {
  const { type, value } = reward;

  switch (type) {
    case 'xiuwei':
      set('xiuwei', (get('xiuwei') || 0) + (value as number));
      break;
    case 'shenshi': {
      const maxSh = get('max_shenshi') || 100;
      const curSh = Math.min(maxSh, (get('shenshi') || 0) + (value as number));
      set('shenshi', curSh);
      break;
    }
    case 'shouyuan': {
      const maxSy = (get('max_shouyuan') || 100) + (value as number);
      set('max_shouyuan', maxSy);
      set(
        'shouyuan',
        Math.min((get('shouyuan') || 0) + (value as number), maxSy)
      );
      break;
    }
    case 'lingqi':
      set('xiuwei', (get('xiuwei') || 0) + (value as number));
      break;
    case 'lingqi_rate':
      set('xiulianbeilv', (get('xiulianbeilv') || 0) + (value as number));
      break;
    case 'special':
      break;
    default:
      console.warn('未知的奖励类型:', type);
  }
};
