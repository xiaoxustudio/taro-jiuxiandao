import { random } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import difangData from '@/assets/df.json';
import ysData from '@/assets/ys.json';
import { Container, JXButton, JXSpace, Scroll, Text } from '@/components';
import useActorController from '@/hooks/useActorController';
import { ActorZDType, DiFangType, HuiHeType, YaoShouZDType } from '@/types';
import useScroll from '@/hooks/useScroll';
import styles from './index.module.less';

export default function Shilian() {
  const scrollHook = useScroll();
  const { get } = useActorController();
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
    huihe: 0,
    target: 0, // 出手方
    logs: [], // 日志
    end: false, // 是否战斗结束
    start: false
  });
  /**
   * @description: 重置数据
   * @return {*}
   */
  const resetZhanDou = useCallback(() => {
    clearTimeout(timer.current);
    const parse = ysList[random(0, ysList.length - 1)].split(';');
    setYaoShouInstance({
      name: parse[0],
      qixue: parse[1],
      gongji: parse[2],
      fangyu: parse[3],
      sudu: parse[4],
      baoji: parse[5],
      cl: parse[6],
      xw: parse[7],
      df: parse[8]
    });
    setActorInstance({
      name: get('daohao'),
      qixue: get('qixue'),
      gongji: get('gongji'),
      fangyu: get('fangyu'),
      sudu: get('sudu'),
      baoji: get('baoji')
    });
    setHuiheState({
      huihe: 0,
      target: 0, // 出手方
      logs: [], // 日志
      end: false,
      start: false // 是否开始战斗
    });
  }, [get, ysList]);

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
              {zd1.name}突然向{zd2.name}发动攻击，造成：
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
        return;
      }
      if (YaoShouInstance.qixue <= 0) {
        setHuiheState((v) => ({
          ...v,
          logs: [
            ...v.logs,
            {
              text: <>{YaoShouInstance.name}阵亡了</>
            }
          ]
        }));
        clearTimeout(timer.current);
        setHuiheState((v) => ({ ...v, start: false, end: true }));
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

  const handleStartZD = useCallback(() => {
    // 已经开始战斗
    if (HuiheState.start) return;
    setHuiheState((v) => ({
      ...v,
      start: true,
      logs: [
        {
          text: <>你发现了{YaoShouInstance?.name}，它似乎也发现了你</>
        }
      ]
    }));
    zhandou();
  }, [HuiheState.start, YaoShouInstance?.name, zhandou]);

  useEffect(() => {
    if (HuiheState.start) {
      // eslint-disable-next-line no-bitwise
      timer.current = setTimeout(zhandou, 500);
    }
    scrollHook.scrollTo(scrollHook.dom?.scrollHeight || 0);
  }, [HuiheState]); // eslint-disable-line

  useEffect(() => {
    resetZhanDou();
  }, []); // eslint-disable-line
  return (
    <Container className={styles.container} title={df.name} desc={df.desc}>
      <JXSpace gap={5} between>
        <JXButton onClick={resetZhanDou}>探索</JXButton>
        <JXButton>挂机</JXButton>
        <JXButton>挂机详情</JXButton>
        <JXButton>停挂</JXButton>
        <JXButton>主页</JXButton>
      </JXSpace>
      <JXSpace gap={5} between>
        <JXButton onClick={handleStartZD}>战斗</JXButton>
        <JXButton>查看</JXButton>
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
