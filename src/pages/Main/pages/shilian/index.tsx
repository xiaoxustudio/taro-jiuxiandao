import { useCallback, useEffect, useMemo } from 'react';
import difangData from '@/assets/df.json';
import {
  Box,
  Container,
  JXButton,
  JXModal,
  JXSpace,
  Scroll,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import useScroll from '@/hooks/useScroll';
import { DiFangType } from '@/types';
import { navigateTo, getRealmText, getTotalAttr } from '@/utils';
import { renderNameWithRealmColor, useBattle } from './useBattle';
import styles from './index.module.less';

export default function Shilian() {
  const scrollHook = useScroll();
  const { get, set, actor } = useActorController();
  const df = useMemo(() => {
    const target = difangData.find((v) => v.name === actor?.zd?.df);
    return (target || difangData[0]) as DiFangType;
  }, [actor]);
  useEffect(() => {
    if (!df?.name) return;
    if (get('zd.df') !== df.name) {
      set('zd.df', df.name);
    }
  }, [df?.name, get, set]);

  const {
    isGuaji,
    setGuaji,
    guajiStats,
    YaoShouInstance,
    ActorInstance,
    HuiheState,
    yaoshouMaxQixue,
    actorDamage,
    enemyDamage,
    sessionLoot,
    handleSearchYaoShou,
    handleStartZD,
    handleEscape
  } = useBattle(df, get, set);

  const actorName = ActorInstance
    ? renderNameWithRealmColor(ActorInstance.name)
    : '未入战';
  const yaoshouName = YaoShouInstance
    ? renderNameWithRealmColor(YaoShouInstance.name)
    : '未遭遇';
  const actorRealm = ActorInstance ? getRealmText(get) : '';
  const enemyRealm = YaoShouInstance
    ? `${YaoShouInstance.jingjie || ''}${YaoShouInstance.jingjie1 || ''}${YaoShouInstance.jingjie2 || ''}`
    : '';
  const actorMaxQixue = ActorInstance ? getTotalAttr(get).qixue : 0;
  const actorHpPercent = actorMaxQixue
    ? Math.max(
        0,
        Math.min(100, (Number(ActorInstance?.qixue || 0) / actorMaxQixue) * 100)
      )
    : 0;
  const enemyHpPercent = yaoshouMaxQixue
    ? Math.max(
        0,
        Math.min(
          100,
          (Number(YaoShouInstance?.qixue || 0) / yaoshouMaxQixue) * 100
        )
      )
    : 0;

  const handleSeeYaoShou = useCallback(() => {
    JXModal.show({
      title: '战斗信息',
      content: (
        <>
          <Text color='blue'>我方</Text>
          <Text>名称：{actorName}</Text>
          <Text>
            气血：{ActorInstance?.qixue ?? '-'} / {actorMaxQixue || '-'}
          </Text>
          <Text>境界：{renderNameWithRealmColor(actorRealm) || '-'}</Text>
          <Text>攻击：{ActorInstance?.gongji ?? '-'}</Text>
          <Text>防御：{ActorInstance?.fangyu ?? '-'}</Text>
          <Text>速度：{ActorInstance?.sudu ?? '-'}</Text>
          <Text>暴击：{ActorInstance?.baoji ?? '-'}</Text>
          <Box style={{ marginTop: 8 }} />
          <Text color='orange'>敌方</Text>
          <Text>名称：{yaoshouName}</Text>
          <Text>
            气血：{YaoShouInstance?.qixue ?? '-'} / {yaoshouMaxQixue || '-'}
          </Text>
          <Text>境界：{renderNameWithRealmColor(enemyRealm) || '-'}</Text>
          <Text>攻击：{YaoShouInstance?.gongji ?? '-'}</Text>
          <Text>防御：{YaoShouInstance?.fangyu ?? '-'}</Text>
          <Text>速度：{YaoShouInstance?.sudu ?? '-'}</Text>
          <Text>暴击：{YaoShouInstance?.baoji ?? '-'}</Text>
          <Text>掉落：{YaoShouInstance?.cl ?? '-'}</Text>
        </>
      ),
      disableCancle: true,
      disableOk: true,
      closeOnMaskClick: true
    });
  }, [
    ActorInstance,
    YaoShouInstance,
    actorMaxQixue,
    actorName,
    actorRealm,
    enemyRealm,
    yaoshouMaxQixue,
    yaoshouName
  ]);

  const handleSeeCailiao = useCallback(() => {
    JXModal.show({
      title: '材料清单',
      content: Object.keys(sessionLoot).length ? (
        <>
          {Object.entries(sessionLoot).map(([n, c]) => (
            <Text key={n}>
              {n}X{c}
            </Text>
          ))}
        </>
      ) : (
        <Text>暂无材料</Text>
      ),
      disableCancle: true,
      disableOk: true,
      closeOnMaskClick: true
    });
  }, [sessionLoot]);

  const handleSeeHistory = useCallback(() => {
    JXModal.show({
      title: '战况',
      content: HuiheState.logs.length ? (
        <>
          {HuiheState.logs.map((v, idx) => (
            <Text key={`log-${idx}`}>{v.text}</Text>
          ))}
        </>
      ) : (
        <Text>暂无战况记录</Text>
      ),
      disableCancle: true,
      disableOk: true,
      closeOnMaskClick: true
    });
  }, [HuiheState.logs]);

  const handleSeeGuajiDetail = useCallback(() => {
    JXModal.show({
      title: '挂机详情',
      content: (
        <>
          <Text>总回合数：{guajiStats.totalRounds}</Text>
          <Text>
            胜：{guajiStats.wins}，负：{guajiStats.losses}
          </Text>
          {guajiStats.history.length ? (
            <>
              {guajiStats.history.map((it, idx) => (
                <Text key={`${it.name}-${idx}`}>
                  {it.name}（{it.df}）
                  {it.result === '胜' ? (
                    <Text color='green' inline>
                      胜利
                    </Text>
                  ) : (
                    <Text color='red' inline>
                      失败
                    </Text>
                  )}
                  ，回合数：
                  {it.rounds}
                </Text>
              ))}
            </>
          ) : (
            <Text>暂无挂机战斗记录</Text>
          )}
        </>
      ),
      disableCancle: true,
      disableOk: true,
      closeOnMaskClick: true
    });
  }, [guajiStats]);

  useEffect(() => {
    scrollHook.scrollTo(scrollHook.dom?.scrollHeight || 0);
  }, [HuiheState.logs.length, scrollHook]);

  return (
    <Container className={styles.container} title={df.name} desc={df.desc}>
      <JXSpace gap={5} between>
        <JXButton onClick={handleSearchYaoShou} disabled={HuiheState.can}>
          探索({get('shenshi')})
        </JXButton>
        <JXButton
          disabled={isGuaji || HuiheState.can}
          onClick={() => setGuaji(true)}
        >
          挂机
        </JXButton>
        <JXButton onClick={handleSeeGuajiDetail}>挂机详情</JXButton>
        <JXButton disabled={!isGuaji} onClick={() => setGuaji(false)}>
          停挂
        </JXButton>
        <JXButton
          onClick={() => {
            navigateTo('Main/index', { all: true });
          }}
        >
          主页
        </JXButton>
      </JXSpace>
      <JXSpace gap={5} between>
        <JXButton onClick={handleStartZD} disabled={HuiheState.can}>
          战斗
        </JXButton>
        <JXButton onClick={handleSeeYaoShou}>查看</JXButton>
        <JXButton onClick={handleEscape}>遁逃</JXButton>
        <JXButton onClick={handleSeeCailiao}>材料</JXButton>
        <JXButton onClick={handleSeeHistory}>战况</JXButton>
      </JXSpace>
      <Box className={styles.battleInfoGrid}>
        <Box className={styles.battleCard}>
          <Text className={styles.battleTitle} color='blue'>
            我方
          </Text>
          <Text>名称：{actorName}</Text>
          <Text>气血：</Text>
          <Box className={styles.hpWrap}>
            <Box className={styles.hpBar}>
              <Box
                className={styles.hpFill}
                style={{ width: `${actorHpPercent}%` }}
              />
            </Box>
            {actorDamage && (
              <Text
                key={actorDamage.key}
                className={`${styles.damageFloat} ${
                  actorDamage.isCrit ? styles.damageFloatCrit : ''
                }`}
              >
                {actorDamage.isCrit ? '暴击 ' : ''}-{actorDamage.value}
              </Text>
            )}
          </Box>
          <Text className={styles.hpText}>
            {ActorInstance?.qixue ?? '-'} / {actorMaxQixue || '-'}
          </Text>
          <Text>境界：{renderNameWithRealmColor(actorRealm) || '-'}</Text>
        </Box>
        <Box className={styles.battleCard}>
          <Text className={styles.battleTitle} color='orange'>
            敌方
          </Text>
          <Text>名称：{yaoshouName}</Text>
          <Text>气血：</Text>
          <Box className={styles.hpWrap}>
            <Box className={styles.hpBar}>
              <Box
                className={styles.hpFill}
                style={{ width: `${enemyHpPercent}%` }}
              />
            </Box>
            {enemyDamage && (
              <Text
                key={enemyDamage.key}
                className={`${styles.damageFloat} ${
                  enemyDamage.isCrit ? styles.damageFloatCrit : ''
                }`}
              >
                {enemyDamage.isCrit ? '暴击 ' : ''}-{enemyDamage.value}
              </Text>
            )}
          </Box>
          <Text className={styles.hpText}>
            {YaoShouInstance?.qixue ?? '-'} / {yaoshouMaxQixue || '-'}
          </Text>
          <Text>境界：{renderNameWithRealmColor(enemyRealm) || '-'}</Text>
        </Box>
      </Box>
      <Scroll className={styles.content} Scroll={scrollHook}>
        {!HuiheState.logs.length && (
          <Text color='gray'>
            你来到了
            {df.name}
            ，你不紧不慢的开始了你的修炼方式...
          </Text>
        )}
        {HuiheState.logs.map((v, ind) => (
          <Text key={`${ind}`} color='gray'>
            {v.text}
          </Text>
        ))}
      </Scroll>
    </Container>
  );
}
