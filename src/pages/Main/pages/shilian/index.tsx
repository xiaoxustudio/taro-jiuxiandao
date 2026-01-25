import { random } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import difangData from '@/assets/df.json';
import {
  Container,
  JXButton,
  JXModal,
  JXSpace,
  JXToast,
  Scroll,
  Text
} from '@/components';
import useActorController from '@/hooks/useActorController';
import {
  ActorZDType,
  CWType,
  DiFangType,
  HuiHeType,
  QTItemType,
  YaoShouZDType
} from '@/types';
import useScroll from '@/hooks/useScroll';
import chuwu from '@/utils/chuwu';
import { navigateTo, numberToChinese } from '@/utils';
import styles from './index.module.less';

export default function Shilian() {
  const scrollHook = useScroll();
  const { get, set } = useActorController();
  const [isGuaji, setGuaji] = useState(false);
  // eslint-disable-next-line no-undef
  const timer = useRef<NodeJS.Timeout | number>(-1);
  const guajiTimer = useRef<NodeJS.Timeout | number>(-1);
  const df = useMemo(
    () => difangData.find((v) => v.name === get('zd.df')) as DiFangType,
    [get]
  );
  const genYaoShou = useCallback((): YaoShouZDType => {
    const tierMap: Record<string, number> = {
      练气: 1,
      筑基: 2,
      结丹: 3,
      元婴: 4,
      化神: 5,
      返虚: 6,
      合体: 7,
      大乘: 8
    };
    const tier = tierMap[df.jingjie] || 1;
    const namesA = ['凶', '烈', '青', '赤', '玄', '金', '灵', '幽', '噬', '炎'];
    const namesB = ['狼', '虎', '蛛', '蟒', '狮', '猿', '鳄', '蝎', '熊', '雕'];
    const na = namesA[random(0, namesA.length - 1)];
    const nb = namesB[random(0, namesB.length - 1)];
    const jj1Max = df.jingjie === '练气' ? 12 : 9;
    const jj1 = random(1, jj1Max);
    const jj2Arr = ['初期', '中期', '后期', '圆满', '大圆满'];
    const jj2 = jj2Arr[random(0, jj2Arr.length - 1)];
    const dropPools: Record<string, string[]> = {
      练气: ['妖丹', '千叶草', '草灵', '魔晶'],
      筑基: ['百灵血竹', '枯木灵藤', '木之精华', '彳果', '柔水', '妖丹'],
      结丹: ['灵氩液', '木之精华', '草灵', '妖丹', '柔水'],
      元婴: ['残·龙魂', '灵氩液', '木之精华', '妖丹'],
      化神: ['灵氩液', '木之精华', '妖丹'],
      返虚: ['灵氩液', '妖丹'],
      合体: ['灵氩液', '妖丹'],
      大乘: ['灵氩液', '妖丹']
    };
    const clPool = dropPools[df.jingjie] || dropPools['练气'];
    const clName = clPool[random(0, clPool.length - 1)];
    const stageCoefMap: Record<string, number> = {
      初期: 1.0,
      中期: 1.1,
      后期: 1.2,
      圆满: 1.3,
      大圆满: 1.4
    };
    const j1Coef = 1 + (jj1 - 1) * 0.05;
    const stageCoef = stageCoefMap[jj2] || 1.0;
    const scale = tier * j1Coef * stageCoef;
    const qixue = Math.round(random(600, 1000) * scale);
    const gongji = Math.round(random(50, 120) * scale);
    const fangyu = Math.round(random(25, 70) * scale);
    const sudu = Math.round(
      (20 + random(0, 15) + tier) * (1 + (jj1 - 1) * 0.01)
    );
    const baoji = Math.min(50, random(3, 10 + tier));
    const xw = Math.round(
      random(80, 200) * tier * (1 + (jj1 - 1) * 0.03) * stageCoef
    );
    return {
      name: `${na}${nb}(${df.jingjie}${numberToChinese(jj1)}阶${jj2})`,
      qixue,
      gongji,
      fangyu,
      sudu,
      baoji,
      cl: clName,
      xw,
      df: df.name
    };
  }, [df]);
  const [YaoShouInstance, setYaoShouInstance] = useState<YaoShouZDType | null>(
    null
  ); // 妖兽实例
  const [ActorInstance, setActorInstance] = useState<ActorZDType | null>(null); //  角色实例
  const [HuiheState, setHuiheState] = useState<HuiHeType>({
    guaji: false,
    huihe: 0,
    target: 0, // 出手方
    logs: [], // 日志
    end: true, // 是否战斗结束
    can: false // 是否可以开始战斗
  });
  const endRef = useRef(HuiheState.end);
  const guajiLockRef = useRef(false);
  const autoBattleTimer = useRef<NodeJS.Timeout | number>(-1);
  /**
   * @description: 一次攻击
   * @return {*}
   */
  const zhandouLogic = (
    zd1: YaoShouZDType | ActorZDType,
    zd2: YaoShouZDType | ActorZDType
  ) => {
    let b = false;
    const bj = random(1, 100);
    const isCrit = bj <= zd1.baoji;
    const critMul = isCrit ? 1.5 : 1;
    const baseAtk = Math.max(0, Math.round(zd1.gongji * critMul));
    const def = Math.max(0, zd2.fangyu);
    const damage = Math.max(1, Math.round(baseAtk * (100 / (100 + def))));
    b = isCrit;
    const newHp = Math.max(0, Math.round(zd2.qixue - damage));
    const defender = { ...zd2, qixue: newHp };
    setHuiheState((v) => ({
      ...v,
      logs: [
        ...v.logs,
        {
          text: (
            <>
              <Text color='black' inline>
                {zd1.name}
              </Text>
              突然{b && '使出全力一击'}向
              <Text color='black' inline>
                {zd2.name}
              </Text>
              发动攻击，造成：
              <Text color='red' inline bold={b}>
                {damage}
              </Text>
              ，剩余血量：
              <Text color='red' inline>
                {defender.qixue}
              </Text>
            </>
          )
        }
      ]
    }));
    return defender;
  };

  const zhandou = useCallback(() => {
    if (ActorInstance && YaoShouInstance) {
      // 判断胜负
      if (ActorInstance.qixue <= 0) {
        setHuiheState((v) => ({
          ...v,
          logs: [
            ...v.logs,
            {
              text: <>你阵亡了</>
            }
          ]
        }));
        clearTimeout(timer.current);
        setHuiheState((v) => ({ ...v, can: false, end: true, target: 0 }));
        const lastName = YaoShouInstance.name;
        setTimeout(() => {
          if (YaoShouInstance?.name === lastName) {
            setYaoShouInstance(null);
          }
        }, 1200);
        setActorInstance(null);
        return;
      }
      if (YaoShouInstance.qixue <= 0) {
        const clData = {
          name: YaoShouInstance.cl,
          isPile: true,
          type: CWType.QT,
          num: random(1, 4)
        } as QTItemType;
        setHuiheState((v) => ({
          ...v,
          logs: [
            ...v.logs,
            {
              text: <>{YaoShouInstance.name}阵亡了</>
            },
            {
              text: (
                <>
                  你获得材料：{clData.name}X{clData.num}
                </>
              )
            },
            {
              text: <>你获得修为：{YaoShouInstance.xw}</>
            }
          ]
        }));
        clearTimeout(timer.current);
        chuwu.Add(clData);
        set('xiuwei', get('xiuwei') + YaoShouInstance.xw);
        setHuiheState((v) => ({ ...v, can: false, end: true, target: 0 }));
        const lastName2 = YaoShouInstance.name;
        setTimeout(() => {
          if (YaoShouInstance?.name === lastName2) {
            setYaoShouInstance(null);
          }
        }, 1200);
        setActorInstance(null);
        return;
      }
      // 战斗计算
      if (!HuiheState.target) {
        const ys = zhandouLogic(ActorInstance, YaoShouInstance);
        setYaoShouInstance(ys as YaoShouZDType);
        setHuiheState((v) => ({ ...v, target: 1 }));
      } else {
        const ac = zhandouLogic(YaoShouInstance, ActorInstance);
        setActorInstance(ac as ActorZDType);
        setHuiheState((v) => ({ ...v, target: 0 }));
      }
      setHuiheState((v) => ({ ...v, huihe: v.huihe + 1 }));
    }
  }, [ActorInstance, HuiheState.target, YaoShouInstance, get, set]);

  /**
   * @description: 探索
   * @param {*} useCallback
   * @return {*}
   */
  const handleSearchYaoShou = useCallback(() => {
    if (!HuiheState.end) {
      JXToast('请先解决当前的妖兽！').show();
      return;
    }

    const newYaoShou = genYaoShou();

    // 立即更新状态
    setYaoShouInstance(newYaoShou);
    setActorInstance({
      name: get('daohao'),
      qixue: get('qixue') + get('addAttr.qixue'),
      gongji: get('gongji') + get('addAttr.gongji'),
      fangyu: get('fangyu') + get('addAttr.fangyu'),
      sudu: get('sudu') + get('addAttr.sudu'),
      baoji: get('baoji') + get('addAttr.baoji')
    });

    // 使用同步生成的妖兽名称
    setHuiheState((prev) => ({
      ...prev,
      can: false,
      logs: [
        { text: `你发现了${newYaoShou.name}，它似乎也发现了你` } // 直接使用newYaoShou
      ],
      end: false
    }));
    set('shenshi', get('shenshi') - 1);
  }, [HuiheState.end, genYaoShou, get, set]);

  /**
   * @description: 开始战斗
   * @param {*} useCallback
   * @return {*}
   */
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

  const handleSeeYaoShou = useCallback(() => {
    JXModal.show({
      title: YaoShouInstance?.name,
      content: (
        <>
          <Text>气血：{YaoShouInstance?.qixue}</Text>
          <Text>攻击：{YaoShouInstance?.gongji}</Text>
          <Text>防御：{YaoShouInstance?.fangyu}</Text>
          <Text>速度：{YaoShouInstance?.sudu}</Text>
          <Text>暴击：{YaoShouInstance?.baoji}</Text>
          <Text>掉落：{YaoShouInstance?.cl}</Text>
        </>
      ),
      disableCancle: true,
      disableOk: true,
      closeOnMaskClick: true
    });
  }, [YaoShouInstance]);

  useEffect(() => {
    if (HuiheState.can && YaoShouInstance) {
      timer.current = setTimeout(zhandou, 800);
    }
    scrollHook.scrollTo(scrollHook.dom?.scrollHeight || 0);
    return () => {
      if (typeof timer.current === 'number') {
        clearTimeout(timer.current);
      }
    };
  }, [HuiheState, YaoShouInstance, scrollHook]); //eslint-disable-line

  useEffect(() => {
    endRef.current = HuiheState.end;
  }, [HuiheState.end]);

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
      if (typeof guajiTimer.current === 'number') {
        clearInterval(guajiTimer.current as number);
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
      guajiLockRef.current = false;
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
      if (typeof autoBattleTimer.current === 'number') {
        clearTimeout(autoBattleTimer.current as number);
      }
      autoBattleTimer.current = setTimeout(() => {
        handleStartZD();
      }, 800);
    }
    return () => {
      if (typeof autoBattleTimer.current === 'number') {
        clearTimeout(autoBattleTimer.current as number);
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
        <JXButton>挂机详情</JXButton>
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
        <JXButton>副本</JXButton>
        <JXButton>材料</JXButton>
        <JXButton>战况</JXButton>
      </JXSpace>
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
