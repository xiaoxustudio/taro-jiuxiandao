import { random } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import difangData from '@/assets/df.json';
import ysData from '@/assets/ys.json';
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
import { navigateTo } from '@/utils';
import styles from './index.module.less';

export default function Shilian() {
  const scrollHook = useScroll();
  const { get, set } = useActorController();
  // eslint-disable-next-line no-undef
  const timer = useRef<NodeJS.Timeout | number>(-1);
  const df = useMemo(
    () => difangData.find((v) => v.name === get('zd.df')) as DiFangType,
    [get]
  );
  const ysList = useMemo(() => ysData[df.name] as any[], [df.name]);
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
  /**
   * @description: 一次攻击
   * @return {*}
   */
  const zhandouLogic = (
    zd1: YaoShouZDType | ActorZDType,
    zd2: YaoShouZDType | ActorZDType
  ) => {
    let b = false;
    // 暴击
    const bj = random(1, 100);
    if (bj <= zd1.baoji) {
      zd1.gongji *= 2;
      b = true;
    }
    // 破防
    zd1.gongji = zd2.fangyu - zd1.gongji < 0 ? 0 : zd2.fangyu - zd1.gongji;
    zd2.qixue = zd1.qixue - zd1.gongji;
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
                {zd1.gongji}
              </Text>
              ，剩余血量：
              <Text color='red' inline>
                {zd2.qixue}
              </Text>
            </>
          )
        }
      ]
    }));
    return zd1;
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
        setHuiheState((v) => ({ ...v, start: false, end: true }));
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
            }
          ]
        }));
        clearTimeout(timer.current);
        chuwu.Add(clData);
        setHuiheState((v) => ({ ...v, start: false, end: true }));
        setActorInstance(null);
        return;
      }
      // 战斗计算
      if (!HuiheState.target) {
        // 我方出手
        const actor = zhandouLogic(ActorInstance, YaoShouInstance);
        setActorInstance(actor);
        setHuiheState((v) => ({ ...v, target: 1 }));
      } else {
        // 敌方出手
        const yaoshou = zhandouLogic(YaoShouInstance, ActorInstance);
        setYaoShouInstance(yaoshou as YaoShouZDType);
        setHuiheState((v) => ({ ...v, target: 0 }));
      }
      setHuiheState((v) => ({ ...v, huihe: v.huihe + 1 }));
    }
  }, [ActorInstance, HuiheState.target, YaoShouInstance]);

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

    // 直接生成妖兽数据
    const parse = ysList[random(0, ysList.length - 1)].split(';');
    const newYaoShou = {
      name: parse[0],
      qixue: parse[1],
      gongji: parse[2],
      fangyu: parse[3],
      sudu: parse[4],
      baoji: parse[5],
      cl: parse[6],
      xw: parse[7],
      df: parse[8]
    };

    // 立即更新状态
    setYaoShouInstance(newYaoShou);
    setActorInstance({
      name: get('daohao'),
      qixue: get('qixue'),
      gongji: get('gongji'),
      fangyu: get('fangyu'),
      sudu: get('sudu'),
      baoji: get('baoji')
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
  }, [HuiheState.end, get, set, ysList]);

  /**
   * @description: 开始战斗
   * @param {*} useCallback
   * @return {*}
   */
  const handleStartZD = useCallback(() => {
    if (!HuiheState.can) {
      setHuiheState({
        ...HuiheState,
        can: true
      });
      zhandou();
    } else {
      JXToast('妖兽死亡，请继续探索！').show();
    }
  }, [HuiheState, zhandou]);

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
      timer.current = setTimeout(zhandou, 1);
    }
    scrollHook.scrollTo(scrollHook.dom?.scrollHeight || 0);
    return () => {
      if (typeof timer.current === 'number') {
        clearTimeout(timer.current);
      }
    };
  }, [HuiheState, YaoShouInstance, scrollHook]); //eslint-disable-line

  return (
    <Container className={styles.container} title={df.name} desc={df.desc}>
      <JXSpace gap={5} between>
        <JXButton onClick={handleSearchYaoShou}>探索</JXButton>
        <JXButton>挂机</JXButton>
        <JXButton>挂机详情</JXButton>
        <JXButton>停挂</JXButton>
        <JXButton
          onClick={() => {
            navigateTo('Main/index', { replace: true });
          }}
        >
          主页
        </JXButton>
      </JXSpace>
      <JXSpace gap={5} between>
        <JXButton onClick={handleStartZD}>战斗</JXButton>
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
