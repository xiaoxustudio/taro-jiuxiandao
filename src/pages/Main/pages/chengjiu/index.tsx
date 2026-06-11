import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  JXButton,
  JXSpace,
  JXToast,
  Text,
  Scroll
} from '@/components';
import useActorController from '@/hooks/useActorController';
import {
  AchievementCategory,
  AchievementData,
  AchievementItem
} from '@/types/chengjiu';
import {
  ACHIEVEMENT_CATEGORY_MAP,
  claimAchievementReward,
  getAchievementsByCategory,
  getUnclaimedAchievements,
  initAchievements,
  updateAchievementProgress,
  applyAchievementReward
} from '@/utils/chengjiu';
import './index.less';

export default function Chengjiu() {
  const { get, set, actor } = useActorController();
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | 'all'
  >('all');
  const [achievementData, setAchievementData] = useState<AchievementData>(
    () => {
      const saved = get('chengjiu') as AchievementData | null | undefined;
      return saved || initAchievements();
    }
  );

  // 使用 ref 存储最新的 achievementData，避免 updateProgress 依赖 achievementData
  const achievementDataRef = useRef(achievementData);
  useEffect(() => {
    achievementDataRef.current = achievementData;
  }, [achievementData]);

  // 更新成就进度
  const updateProgress = useCallback(() => {
    const progress = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      battleCount: get('battleCount' as any) || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      winStreak: get('winStreak' as any) || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gongfaCount: get('gongfa.ls' as any)?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fabaoCount: Object.values(get('fabao' as any) || {}).filter(Boolean)
        .length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      danfangCount: get('danfang' as any)?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      qiandaoStreak: get('qiandao.streak' as any) || 0
    };

    const updated = updateAchievementProgress(
      achievementDataRef.current,
      actor,
      progress
    );
    setAchievementData(updated);
    set('chengjiu', updated);
  }, [actor, get, set]);

  // 使用 ref 存储 updateProgress 函数的最新引用
  const updateProgressRef = useRef(updateProgress);
  useEffect(() => {
    updateProgressRef.current = updateProgress;
  }, [updateProgress]);

  // 初始化时更新进度，并在页面显示时自动刷新
  useEffect(() => {
    // 使用 ref.current 来调用最新的 updateProgress
    const tick = () => updateProgressRef.current();
    tick();
    // 设置定时器，每5秒刷新一次成就进度
    const timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, []);

  // 获取当前分类的成就列表
  const achievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.values(achievementData.achievements);
    }
    return getAchievementsByCategory(
      achievementData,
      selectedCategory as AchievementCategory
    );
  }, [achievementData, selectedCategory]);

  // 获取未领取的成就
  const unclaimedAchievements = useMemo(
    () => getUnclaimedAchievements(achievementData),
    [achievementData]
  );

  // 领取奖励
  const handleClaim = useCallback(
    (achievementId: string) => {
      const result = claimAchievementReward(achievementData, achievementId);

      if (!result.success) {
        JXToast(result.error || '领取失败').show();
        return;
      }

      // 应用奖励
      if (result.rewards && result.rewards.length > 0) {
        result.rewards.forEach((reward: any) => {
          applyAchievementReward(reward, set, get);
        });
      }

      // 更新成就数据
      const updated = { ...achievementData };
      updated.claimedIds.push(achievementId);
      updated.claimedPoints +=
        achievementData.achievements[achievementId].points || 0;
      updated.achievements[achievementId].status = 'claimed';
      updated.achievements[achievementId].claimedAt = Date.now();

      setAchievementData(updated);
      set('chengjiu', updated);

      JXToast('领取成功！').show();
    },
    [achievementData, get, set]
  );

  // 渲染成就项
  const renderAchievementItem = (achievement: AchievementItem) => {
    const isCompleted =
      achievement.status === 'completed' || achievement.status === 'claimed';
    const isClaimed = achievement.status === 'claimed';

    return (
      <div key={achievement.id} className='achievement-item'>
        <div className='achievement-header'>
          <Text bold size={16}>
            {achievement.name}
          </Text>
          <Text color={isCompleted ? '#52c41a' : '#999'}>
            {achievement.points}成就点
          </Text>
        </div>
        <div className='achievement-content'>
          <Text size={14} color='#666'>
            {achievement.desc}
          </Text>
          <div className='achievement-progress'>
            <Text size={12} color='#999'>
              进度: {achievement.progress}/{achievement.target}
            </Text>
          </div>
          {isCompleted && !isClaimed && (
            <JXButton size='mini' onClick={() => handleClaim(achievement.id)}>
              领取奖励
            </JXButton>
          )}
          {isClaimed && (
            <Text size={12} color='#52c41a'>
              已领取
            </Text>
          )}
        </div>
        {achievement.reward && achievement.reward.length > 0 && (
          <div className='achievement-rewards'>
            <Text size={12} color='#999'>
              奖励: {achievement.reward.map((r) => r.desc).join(', ')}
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <Container title='成就' desc='记录你在修仙之路上的每一个里程碑'>
      <JXSpace direction='vertical' gap={10}>
        {/* 成就统计 */}
        <div className='achievement-stats'>
          <Text>
            已获得成就点: {achievementData.claimedPoints}/
            {achievementData.totalPoints}
          </Text>
          {unclaimedAchievements.length > 0 && (
            <Text color='#ff7875'>
              {unclaimedAchievements.length}个成就可领取
            </Text>
          )}
        </div>

        {/* 分类筛选 */}
        <div className='achievement-categories'>
          <JXButton
            size='mini'
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </JXButton>
          {(Object.keys(ACHIEVEMENT_CATEGORY_MAP) as AchievementCategory[]).map(
            (category) => (
              <JXButton
                key={category}
                size='mini'
                color={selectedCategory === category ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category)}
              >
                {ACHIEVEMENT_CATEGORY_MAP[category]}
              </JXButton>
            )
          )}
        </div>

        {/* 成就列表 */}
        <Scroll>
          <div className='achievement-list'>
            {achievements.length > 0 ? (
              achievements.map((achievement) =>
                renderAchievementItem(achievement)
              )
            ) : (
              <Text color='#999' center>
                暂无成就
              </Text>
            )}
          </div>
        </Scroll>
      </JXSpace>
    </Container>
  );
}
