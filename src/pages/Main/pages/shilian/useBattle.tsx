import { random } from 'lodash-es';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { JXToast, Text } from '@/components';
import {
  REALM_GRADE_WEIGHTS,
  SeedRegistryItem,
  clGrades,
  flattenMaterialPool
} from '@/assets/const';
import useStorageStore from '@/services/storage';
import {
  ActorZDType,
  CWType,
  DiFangType,
  HuiHeType,
  QTItemType,
  YaoyuanData,
  YaoShouZDType
} from '@/types';
import { JingJie1ToNumber } from '@/utils/actor';
import { updateAchievementProgress } from '@/utils/chengjiu';
import {
  checkLingShouAchievements,
  checkShilianAchievements
} from '@/utils/chengjiuHelper';
import { addLingShouExp, getLingShouBonus } from '@/utils/lingshou';
import chuwu from '@/utils/chuwu';
import {
  JJ2_ARR,
  MONSTER_NAME_PARTS,
  STAGE_INDEX_MAP,
  TIER_MAP,
  buildMonsterBaseAttributes,
  calcAttrScale,
  calcZhanDouHit,
  compositeDifficultyCoef,
  numberToChinese,
  pickMaterialNameByGrade,
  pickWeightedIndex,
  resolveMaterialPoolByGrade,
  splitNameByRealm,
  getTotalAttr
} from '@/utils';

export const renderNameWithRealmColor = (name: string) => {
  const parts = splitNameByRealm(name);
  if (!parts) return name;
  return (
    <>
      {parts.before}
      <Text color={parts.color} inline>
        {parts.realm}
      </Text>
      {parts.after}
    </>
  );
};
const seedDropRates: Record<(typeof clGrades)[number], number> = {
  一品: 0.02,
  二品: 0.018,
  三品: 0.015,
  四品: 0.012,
  五品: 0.01,
  六品: 0.008,
  七品: 0.006,
  八品: 0.004
};

export function useBattle(
  df: DiFangType,
  get: (key: string, defaultValue?: unknown) => any,
  set: (key: string, val: any) => void
) {
  const [isGuaji, setGuaji] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const guajiTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [guajiStats, setGuajiStats] = useState<{
    totalRounds: number;
    wins: number;
    losses: number;
    history: Array<{
      name: string;
      df: string;
      rounds: number;
      result: string;
    }>;
  }>({ totalRounds: 0, wins: 0, losses: 0, history: [] });
  const genYaoShou = useCallback((): YaoShouZDType => {
    const tier = TIER_MAP[df.jingjie] || 1;
    const playerMajor = get('jingjie');
    const playerMinorNum = JingJie1ToNumber(get('jingjie1'));
    const playerStage = get('jingjie2');
    const playerTier = TIER_MAP[playerMajor] || 1;
    const na = MONSTER_NAME_PARTS.A[random(0, MONSTER_NAME_PARTS.A.length - 1)];
    const nb = MONSTER_NAME_PARTS.B[random(0, MONSTER_NAME_PARTS.B.length - 1)];
    const jj1Max = df.jingjie === '练气' ? 12 : 9;
    let jj1: number;
    if (tier === playerTier) {
      const offsets = [-1, 0, 1, 2, 3];
      const weights = [1, 3, 3, 2, 1];
      const pick = offsets[pickWeightedIndex(weights, random)] || 0;
      jj1 = Math.max(1, Math.min(jj1Max, playerMinorNum + pick));
    } else if (tier > playerTier) {
      jj1 = random(Math.max(1, Math.floor(jj1Max * 0.5)), jj1Max);
    } else {
      jj1 = random(
        Math.max(1, playerMinorNum - 2),
        Math.max(1, playerMinorNum)
      );
    }
    const pStageIdx = STAGE_INDEX_MAP[playerStage] ?? 0;
    const stageCandidates: number[] = [];
    const stageWeights: number[] = [];
    for (let i = 0; i < JJ2_ARR.length; i++) {
      const diff = i - pStageIdx;
      let w = 1;
      if (diff === 0) w = 4;
      else if (diff === 1) w = 3;
      else if (diff === 2) w = 2;
      else if (diff === -1) w = 2;
      stageCandidates.push(i);
      stageWeights.push(w);
    }
    const sPickIndex = pickWeightedIndex(stageWeights, random);
    const sPick = stageCandidates[sPickIndex] ?? 0;
    const jj2 = JJ2_ARR[sPick];
    const { getSync: storageGetSync } = useStorageStore.getState();
    const materialPoolByGrade = resolveMaterialPoolByGrade({
      get,
      set,
      storageGetSync
    });
    const weights =
      REALM_GRADE_WEIGHTS[df.jingjie as keyof typeof REALM_GRADE_WEIGHTS] ||
      REALM_GRADE_WEIGHTS['练气'];
    const sumW = weights.reduce((a, b) => a + b, 0) || 1;
    const rPick = random(1, sumW);
    let acc = 0;
    let gradeIndex = 0;
    for (let i = 0; i < weights.length; i += 1) {
      acc += weights[i];
      if (rPick <= acc) {
        gradeIndex = i;
        break;
      }
    }
    const targetGrade = clGrades[gradeIndex] || clGrades[0];
    const flatPool = flattenMaterialPool(materialPoolByGrade);
    const clName = pickMaterialNameByGrade({
      materialPoolByGrade,
      registry: flatPool,
      targetGrade,
      maxGradeIdx: gradeIndex,
      rnd: random
    });
    const { rawQixue, rawGongji, rawFangyu, rawSudu, rawBaoji, rawFashu, xw } =
      buildMonsterBaseAttributes({ tier, jj1, jj2, rnd: random });
    const winStreak = (get('winStreak') as number) || 0;
    const locationAndStreakCoef = compositeDifficultyCoef(tier, winStreak);
    const addAttr = get('addAttr');
    const qixueScale = calcAttrScale(get('qixue'), addAttr.qixue, 0.7, 0.8);
    const gongjiScale = calcAttrScale(get('gongji'), addAttr.gongji, 0.8, 0.9);
    const fangyuScale = calcAttrScale(get('fangyu'), addAttr.fangyu, 0.7, 0.8);
    const suduScale = calcAttrScale(get('sudu'), addAttr.sudu, 0.6, 0.7);
    const baojiScale = calcAttrScale(get('baoji'), addAttr.baoji, 0.6, 0.6);
    const fashuScale = calcAttrScale(get('fashu'), addAttr.fashu, 0.5, 0.6);
    const qixue = Math.round(rawQixue * locationAndStreakCoef * qixueScale);
    const gongji = Math.round(rawGongji * locationAndStreakCoef * gongjiScale);
    const fangyu = Math.round(rawFangyu * locationAndStreakCoef * fangyuScale);
    const sudu = Math.round(rawSudu * locationAndStreakCoef * suduScale);
    const baoji = Math.min(
      60,
      Math.round(rawBaoji * locationAndStreakCoef * baojiScale)
    );
    const fashu = Math.round(rawFashu * locationAndStreakCoef * fashuScale);
    const jj1Label = `${numberToChinese(jj1)}阶`;
    return {
      name: `${na}${nb}`,
      qixue,
      gongji,
      fangyu,
      sudu,
      baoji,
      fashu,
      jingjie: df.jingjie,
      jingjie1: jj1Label,
      jingjie2: jj2,
      cl: clName,
      xw,
      df: df.name
    };
  }, [df.jingjie, df.name, get, set]);
  const [YaoShouInstance, setYaoShouInstance] = useState<YaoShouZDType | null>(
    null
  );
  const [ActorInstance, setActorInstance] = useState<ActorZDType | null>(null);
  const [HuiheState, setHuiheState] = useState<HuiHeType>({
    guaji: false,
    huihe: 0,
    target: 0,
    logs: [],
    end: true,
    can: false
  });
  const MAX_LOG_SIZE = 100;
  const MAX_HISTORY_SIZE = 50;
  const endRef = useRef(HuiheState.end);
  const guajiLockRef = useRef(false);
  const autoBattleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sessionLoot, setSessionLoot] = useState<Record<string, number>>({});
  useEffect(() => () => setSessionLoot({}), []);
  const fightSeqRef = useRef(0);
  const [yaoshouMaxQixue, setYaoshouMaxQixue] = useState(0);
  const [actorDamage, setActorDamage] = useState<{
    value: number;
    key: number;
    isCrit: boolean;
  } | null>(null);
  const [enemyDamage, setEnemyDamage] = useState<{
    value: number;
    key: number;
    isCrit: boolean;
  } | null>(null);
  const isGuajiRef = useRef(isGuaji);
  const currentGuajiFightRoundsRef = useRef(0);
  useEffect(() => {
    isGuajiRef.current = isGuaji;
  }, [isGuaji]);
  const guardClear = useCallback(
    (seq: number, fn: () => void, delay = 1200) => {
      setTimeout(() => {
        if (fightSeqRef.current === seq) {
          fn();
        }
      }, delay);
    },
    []
  );
  const pushLog = useCallback((text: ReactNode) => {
    setHuiheState((v) => ({
      ...v,
      logs: [...v.logs, { text }].slice(-MAX_LOG_SIZE)
    }));
  }, []);
  const endBattle = useCallback(
    (result: 'win' | 'lose', rounds: number, ys: YaoShouZDType | null) => {
      clearInterval(timer.current!);
      setHuiheState((v) => ({ ...v, can: false, end: true, target: 0 }));
      if (isGuajiRef.current) {
        setGuajiStats((s) => ({
          totalRounds: s.totalRounds + rounds,
          wins: s.wins + (result === 'win' ? 1 : 0),
          losses: s.losses + (result === 'lose' ? 1 : 0),
          history: [
            ...s.history,
            {
              name: ys?.name ?? '',
              df: ys?.df ?? '',
              rounds,
              result: result === 'win' ? '胜' : '负'
            }
          ].slice(-MAX_HISTORY_SIZE)
        }));
        currentGuajiFightRoundsRef.current = 0;
      }
      guardClear(fightSeqRef.current, () => {
        setYaoShouInstance(null);
        setYaoshouMaxQixue(0);
      });
      setActorInstance(null);
    },
    [guardClear]
  );
  const zhandouLogic = useCallback(
    (zd1: YaoShouZDType | ActorZDType, zd2: YaoShouZDType | ActorZDType) => {
      const { isCrit, damage, fashuBonus, defender } = calcZhanDouHit(zd1, zd2);
      const isEnemyAttacker = 'df' in zd1;
      const isEnemyDefender = 'df' in zd2;
      const attackerColor = isEnemyAttacker ? 'orange' : 'blue';
      const defenderColor = isEnemyDefender ? 'orange' : 'blue';
      const damageKey = Date.now() + Math.floor(Math.random() * 1000);
      if (isEnemyAttacker) {
        setActorDamage({ value: damage, key: damageKey, isCrit });
      } else {
        setEnemyDamage({ value: damage, key: damageKey, isCrit });
      }
      pushLog(
        <>
          <Text color={attackerColor} inline>
            【{isEnemyAttacker ? '敌' : '我'}】
            {renderNameWithRealmColor(zd1.name)}
          </Text>
          {isCrit ? (
            <>
              乘隙爆发，重拳落下，造成
              <Text color='red' inline bold>
                {damage}
              </Text>
              点伤害
              {fashuBonus > 0 ? (
                <>
                  （含法术
                  <Text color='purple' inline>
                    {fashuBonus}
                  </Text>
                  ）
                </>
              ) : null}
              ；
            </>
          ) : (
            <>
              抓住空档一击，造成
              <Text color='red' inline>
                {damage}
              </Text>
              点伤害
              {fashuBonus > 0 ? (
                <>
                  （含法术
                  <Text color='purple' inline>
                    {fashuBonus}
                  </Text>
                  ）
                </>
              ) : null}
              ；
            </>
          )}
          <Text color={defenderColor} inline>
            【{isEnemyDefender ? '敌' : '我'}】
            {renderNameWithRealmColor(zd2.name)}
          </Text>
          气血仅余
          <Text color='red' inline>
            {defender.qixue}
          </Text>
        </>
      );
      return defender;
    },
    [pushLog]
  );

  const zhandou = useCallback(() => {
    if (ActorInstance && YaoShouInstance) {
      if (ActorInstance.qixue <= 0) {
        pushLog(<>势尽力竭，你踉跄后退终究倒下。眼前一黑，此战以败收场…</>);
        endBattle('lose', currentGuajiFightRoundsRef.current, YaoShouInstance);
        const currentAchievementData = get('chengjiu') || {
          achievements: {},
          claimedIds: [],
          totalPoints: 0,
          claimedPoints: 0
        };
        const battleCount = (get('battleCount') || 0) + 1;
        set('battleCount', battleCount);
        set('winStreak', 0);
        const updatedAchievementData = updateAchievementProgress(
          currentAchievementData,
          { lv: get('lv'), jingjie: get('jingjie') },
          { battleCount, winStreak: 0 }
        );
        set('chengjiu', updatedAchievementData);
        return;
      }
      if (YaoShouInstance.qixue <= 0) {
        const clData = {
          name: YaoShouInstance.cl,
          isPile: true,
          type: CWType.QT,
          num: random(1, 4)
        } as QTItemType;
        const seedRegistry = (get('seedRegistry') as SeedRegistryItem[]) || [];
        const materialPool = resolveMaterialPoolByGrade({
          get,
          set,
          storageGetSync: useStorageStore.getState().getSync
        });
        const flatPool = materialPool ? flattenMaterialPool(materialPool) : [];
        const materialGrade =
          flatPool.find((item) => item.name === clData.name)?.itype ||
          seedRegistry.find((item) => item.material === clData.name)?.itype ||
          clGrades[0];
        const seedDropRate = seedDropRates[materialGrade] ?? 0;
        const shouldDropSeed =
          seedRegistry.length > 0 && Math.random() < seedDropRate;
        let seedDrop: SeedRegistryItem | null = null;
        const gradeSeeds = seedRegistry.filter(
          (item) => item.itype === materialGrade
        );
        if (shouldDropSeed) {
          seedDrop =
            seedRegistry.find((item) => item.material === clData.name) ||
            (gradeSeeds.length
              ? gradeSeeds[random(0, gradeSeeds.length - 1)]
              : null) ||
            null;
        }
        const reward = random(
          Math.max(1, Math.round(YaoShouInstance.xw * 0.7)),
          Math.max(1, Math.round(YaoShouInstance.xw * 1.2))
        );
        const tier = TIER_MAP[YaoShouInstance.jingjie] || 1;
        const lingShiDrop = random(
          Math.max(1, tier * 15),
          Math.max(2, tier * tier * 20)
        );
        const cw = get('cw');
        const slotCount =
          (cw?.fb?.length || 0) + (cw?.dy?.length || 0) + (cw?.qt?.length || 0);
        const cwMax = cw?.max || 30;
        if (slotCount >= cwMax) {
          JXToast('储物空间已满，战利品将丢失！').show();
        }
        pushLog(
          <>
            <Text color='black' inline>
              {renderNameWithRealmColor(YaoShouInstance.name)}
            </Text>
            倒地不起，你收剑而立，心神一清，悟得一缕斗法之理（修为+
            <Text color='red' inline>
              {reward}
            </Text>
            ）
          </>
        );
        pushLog(
          <>
            你获得材料：{clData.name}X{clData.num}
          </>
        );
        pushLog(<>获得灵石：{lingShiDrop}</>);
        if (seedDrop) {
          pushLog(<>获得种子：{seedDrop.name}</>);
        }
        pushLog(<>战斗结束</>);
        chuwu.Add(clData);
        chuwu.Add({
          name: '灵石',
          type: CWType.QT,
          isPile: true,
          num: lingShiDrop
        });
        const shengLingShiChance =
          0.03 + (TIER_MAP[YaoShouInstance.jingjie] || 1) * 0.01;
        if (Math.random() < shengLingShiChance) {
          const shengLsNum = random(
            1,
            Math.min(
              3,
              Math.floor((TIER_MAP[YaoShouInstance.jingjie] || 1) / 2) + 1
            )
          );
          chuwu.Add({
            name: '升灵石',
            type: CWType.QT,
            isPile: true,
            num: shengLsNum
          });
        }
        if (seedDrop) {
          const currentYaoyuan = get('yaoyuan') as YaoyuanData | null;
          if (currentYaoyuan) {
            const currentSeeds = currentYaoyuan.seeds ?? [];
            const existing = currentSeeds.find(
              (item) => item.name === seedDrop?.name
            );
            const updatedSeeds = existing
              ? currentSeeds.map((item) =>
                  item.name === seedDrop?.name
                    ? { ...item, num: item.num + 1 }
                    : item
                )
              : [...currentSeeds, { ...seedDrop, num: 1 }];
            set('yaoyuan', { ...currentYaoyuan, seeds: updatedSeeds });
          }
        }
        set('xiuwei', Math.min(get('max_xiuwei'), get('xiuwei') + reward));
        const currentLingShou = get('lingShou');
        if (currentLingShou) {
          set(
            'lingShou',
            addLingShouExp(currentLingShou, Math.round(reward * 0.3))
          );
        }
        setSessionLoot((prev) => ({
          ...prev,
          [clData.name]: (prev[clData.name] || 0) + clData.num!
        }));
        endBattle('win', currentGuajiFightRoundsRef.current, YaoShouInstance);
        const currentAchievementData = get('chengjiu') || {
          achievements: {},
          claimedIds: [],
          totalPoints: 0,
          claimedPoints: 0
        };
        const battleCount = (get('battleCount') || 0) + 1;
        set('battleCount', battleCount);
        const currentWinStreak = get('winStreak') || 0;
        const newWinStreak = currentWinStreak + 1;
        set('winStreak', newWinStreak);
        const updatedAchievementData = updateAchievementProgress(
          currentAchievementData,
          { lv: get('lv'), jingjie: get('jingjie') },
          { battleCount, winStreak: newWinStreak }
        );
        set('chengjiu', updatedAchievementData);
        checkShilianAchievements(
          get,
          set,
          { lv: get('lv'), jingjie: get('jingjie') },
          df.name
        );
        checkLingShouAchievements(get, set, {
          lv: get('lv'),
          jingjie: get('jingjie')
        });
        return;
      }
      if (!HuiheState.target) {
        const ys = zhandouLogic(ActorInstance, YaoShouInstance);
        setYaoShouInstance(ys as YaoShouZDType);
        setHuiheState((v) => ({ ...v, target: 1 }));
      } else {
        const ac = zhandouLogic(YaoShouInstance, ActorInstance);
        setActorInstance(ac as ActorZDType);
        setHuiheState((v) => ({ ...v, target: 0 }));
      }
      if (isGuajiRef.current) {
        currentGuajiFightRoundsRef.current += 1;
      }
      setHuiheState((v) => ({ ...v, huihe: v.huihe + 1 }));
    }
  }, [
    ActorInstance,
    HuiheState.target,
    YaoShouInstance,
    df.name,
    get,
    set,
    pushLog,
    endBattle,
    zhandouLogic
  ]);

  const handleSearchYaoShou = useCallback(() => {
    if (get('shenshi') <= 0) {
      JXToast('你没有足够的精神！').show();
      return;
    }
    if (!HuiheState.end) {
      JXToast('请先解决当前的妖兽！').show();
      return;
    }

    const newYaoShou = genYaoShou();

    fightSeqRef.current += 1;
    setYaoShouInstance(newYaoShou);
    setYaoshouMaxQixue(newYaoShou.qixue);
    const ls = get('lingShou');
    const lsBonus = ls
      ? getLingShouBonus(ls)
      : { gongji: 0, fangyu: 0, qixue: 0 };
    const total = getTotalAttr(get);
    setActorInstance({
      name: get('daohao'),
      qixue: total.qixue + lsBonus.qixue,
      gongji: total.gongji + lsBonus.gongji,
      fangyu: total.fangyu + lsBonus.fangyu,
      sudu: total.sudu,
      baoji: Math.min(90, total.baoji),
      fashu: total.fashu
    });

    setHuiheState((prev) => ({
      ...prev,
      can: false,
      logs: [{ text: `你发现了${newYaoShou.name}，它似乎也发现了你` }],
      end: false
    }));
    set('shenshi', get('shenshi') - 1);
  }, [HuiheState.end, genYaoShou, get, set]);

  const handleStartZD = useCallback(() => {
    if (!ActorInstance || !YaoShouInstance) {
      JXToast('请先探索妖兽！').show();
      return;
    }
    if (!HuiheState.can) {
      const first =
        (ActorInstance?.sudu || 0) >= (YaoShouInstance?.sudu || 0) ? 0 : 1;
      setHuiheState({
        ...HuiheState,
        can: true,
        target: first
      });
      zhandou();
    } else {
      JXToast('战斗进行中，请稍候！').show();
    }
  }, [ActorInstance, YaoShouInstance, HuiheState, zhandou]);

  const handleEscape = useCallback(() => {
    const noBattle = HuiheState.end || (!ActorInstance && !YaoShouInstance);
    if (noBattle) {
      JXToast('当前未与妖兽交手，无需遁逃').show();
      return;
    }
    const shen = get('shenshi');
    if (shen <= 0) {
      JXToast('神识不足，无法遁逃').show();
      return;
    }
    if (timer.current) {
      clearInterval(timer.current);
    }
    const baseCost = Math.max(
      2,
      Math.min(10, Math.round(((YaoShouInstance?.xw || 0) as number) / 150))
    );
    const cost = Math.min(baseCost, shen);
    set('shenshi', shen - cost);
    pushLog(
      <>
        <Text color='blue' inline>
          【我】{get('daohao')}
        </Text>
        遁光一闪，脱离战圈（神识-
        <Text color='red' inline>
          {cost}
        </Text>
        ）
      </>
    );
    setHuiheState((v) => ({ ...v, can: false, end: true, target: 0 }));
    guardClear(
      fightSeqRef.current,
      () => {
        setYaoShouInstance(null);
        setYaoshouMaxQixue(0);
      },
      800
    );
    setActorInstance(null);
    if (isGuajiRef.current) {
      setGuaji(false);
    }
  }, [
    ActorInstance,
    HuiheState.end,
    YaoShouInstance,
    get,
    set,
    guardClear,
    pushLog
  ]);

  const handleSearchYaoShouRef = useRef(handleSearchYaoShou);
  const getRef = useRef(get);
  useEffect(() => {
    handleSearchYaoShouRef.current = handleSearchYaoShou;
  }, [handleSearchYaoShou]);
  useEffect(() => {
    getRef.current = get;
  }, [get]);

  useEffect(() => {
    const cleanup = () => {
      if (typeof timer.current === 'number') {
        clearInterval(timer.current as number);
      }
    };
    if (HuiheState.can && ActorInstance && YaoShouInstance) {
      cleanup();
      timer.current = setInterval(() => {
        zhandou();
      }, 800);
    } else {
      cleanup();
    }
    return cleanup;
  }, [HuiheState.can, ActorInstance, YaoShouInstance, zhandou]);

  useEffect(() => {
    endRef.current = HuiheState.end;
  }, [HuiheState.end]);

  useEffect(() => {
    if (!ActorInstance) {
      setActorDamage(null);
    }
    if (!YaoShouInstance) {
      setEnemyDamage(null);
    }
  }, [ActorInstance, YaoShouInstance]);

  useEffect(() => {
    const cleanup = () => {
      if (guajiTimer.current) {
        clearInterval(guajiTimer.current);
      }
    };
    if (!isGuaji) {
      cleanup();
      return cleanup;
    }
    const run = () => {
      if (guajiLockRef.current) return;
      if (!endRef.current) return;
      const shen = getRef.current('shenshi');
      if (shen <= 0) {
        setGuaji(false);
        JXToast('神识不足，已停止挂机').show();
        return;
      }
      guajiLockRef.current = true;
      endRef.current = false;
      handleSearchYaoShouRef.current();
      setTimeout(() => {
        guajiLockRef.current = false;
      }, 300);
    };
    run();
    guajiTimer.current = setInterval(run, 1500);
    return cleanup;
  }, [isGuaji]);

  useEffect(() => {
    if (
      isGuaji &&
      !HuiheState.can &&
      !HuiheState.end &&
      ActorInstance &&
      YaoShouInstance
    ) {
      if (autoBattleTimer.current) {
        clearTimeout(autoBattleTimer.current);
      }
      autoBattleTimer.current = setTimeout(() => {
        handleStartZD();
      }, 800);
    }
    return () => {
      if (autoBattleTimer.current) {
        clearTimeout(autoBattleTimer.current);
      }
    };
  }, [
    isGuaji,
    HuiheState.can,
    HuiheState.end,
    ActorInstance,
    YaoShouInstance,
    handleStartZD
  ]);

  return {
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
  };
}
