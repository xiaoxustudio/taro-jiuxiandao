import cloneDeep from 'lodash-es/cloneDeep';
import type { AchievementItem, AchievementData } from '@/types/chengjiu';
import { updateAchievementProgress, checkCondition } from './chengjiu';

/**
 * 检查并更新成就进度
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 * @param actor - 角色数据
 */
export const checkAchievements = (get: any, set: any, actor: any) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const progress = {
    battleCount: get('battleCount') || 0,
    winStreak: get('winStreak') || 0,
    gongfaCount: get('gongfa.ls')?.length || 0,
    fabaoCount: Object.values(get('fabao') || {}).filter(Boolean).length,
    danfangCount: get('danfang')?.length || 0,
    qiandaoStreak: get('qiandao.streak') || 0
  };

  const updated = updateAchievementProgress(chengjiu, actor, progress);
  set('chengjiu', updated);
};

/**
 * 检查战斗相关成就
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 * @param actor - 角色数据
 * @param isWin - 是否胜利
 */
export const checkBattleAchievements = (
  get: any,
  set: any,
  actor: any,
  isWin: boolean
) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const currentBattleCount = get('battleCount') || 0;
  const currentWinStreak = get('winStreak') || 0;

  const progress = {
    battleCount: currentBattleCount + 1,
    winStreak: isWin ? currentWinStreak + 1 : 0
  };

  const updated = updateAchievementProgress(chengjiu, actor, progress);
  set('chengjiu', updated);
  set('battleCount', progress.battleCount);
  set('winStreak', progress.winStreak);
};

/**
 * 检查收集相关成就
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 * @param actor - 角色数据
 */
export const checkCollectionAchievements = (get: any, set: any, actor: any) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const progress = {
    gongfaCount: get('gongfa.ls')?.length || 0,
    fabaoCount: Object.values(get('fabao') || {}).filter(Boolean).length,
    danfangCount: get('danfang')?.length || 0
  };

  const updated = updateAchievementProgress(chengjiu, actor, progress);
  set('chengjiu', updated);
};

/**
 * 检查修炼相关成就
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 * @param actor - 角色数据
 */
export const checkCultivationAchievements = (
  get: any,
  set: any,
  actor: any
) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const progress = {};

  const updated = updateAchievementProgress(chengjiu, actor, progress);
  set('chengjiu', updated);
};

/**
 * 检查签到成就
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 */
export const checkQiandaoAchievements = (get: any, set: any) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const progress = {
    qiandaoStreak: get('qiandao.streak') || 0
  };

  const updated = cloneDeep(chengjiu) as AchievementData;
  Object.values(updated.achievements).forEach(
    (achievement: AchievementItem) => {
      if (achievement.condition.field === 'qiandaoStreak') {
        const isCompleted = checkCondition(
          achievement.condition,
          null,
          progress
        );
        if (
          isCompleted &&
          achievement.status !== 'completed' &&
          achievement.status !== 'claimed'
        ) {
          achievement.status = 'completed';
          achievement.completedAt = Date.now();
        }
        achievement.progress = progress.qiandaoStreak;
      }
    }
  );
  set('chengjiu', updated);
};

/**
 * 检查社交相关成就
 * @param get - 获取角色数据的函数
 * @param set - 设置角色数据的函数
 * @param actor - 角色数据
 */
export const checkSocialAchievements = (get: any, set: any, actor: any) => {
  const chengjiu = get('chengjiu');
  if (!chengjiu) return;

  const progress = {
    qiandaoStreak: get('qiandao.streak') || 0
  };

  const updated = updateAchievementProgress(chengjiu, actor, progress);
  set('chengjiu', updated);
};
