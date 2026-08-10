import cloneDeep from 'lodash-es/cloneDeep';
import { GongFaType } from '@/types/gongfa';
import type {
  ActorDataConfig,
  AddAttrType,
  ActorDataConfigForZhanDou
} from '@/types/actor';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { getActor } from './actor';
import TimeArray from './TimeArray';
import { checkCollectionAchievements } from './chengjiuHelper';

/* 功法相关 */

/**
 * @description: 根据 id 获取功法
 * @param {string} id
 * @return {*}
 */
function get(id: string): GongFaType | undefined {
  const acData = getActor();
  return acData.gongfa.ls.find((v) => v.id === id);
}

/**
 * @description: 添加功法（可选替换同 id 功法）
 * @param {GongFaType} gf
 * @param {boolean} replace
 * @return {*}
 */
function add(gf: GongFaType, replace = false, checkAchievement = true) {
  const { set } = useActorStore.getState();
  const { current } = useStore.getState();
  const acData = cloneDeep(getActor());
  const existingIndex = acData.gongfa.ls.findIndex((v) => v.id === gf.id);
  if (existingIndex !== -1) {
    if (replace) {
      acData.gongfa.ls[existingIndex] = gf;
      set(current, acData);
    }
    return;
  }
  // 不存在时直接添加（replace 参数在此场景无意义，简化逻辑）
  acData.gongfa.ls.push(gf);
  set(current, acData);
  // 检查收集成就
  if (checkAchievement) {
    const deepCopy = cloneDeep(acData);
    checkCollectionAchievements(
      (key: keyof ActorDataConfig) => deepCopy[key],
      (key: string, value: unknown) => {
        const updated = cloneDeep(deepCopy);
        (updated as unknown as Record<string, unknown>)[key] = value;
        set(current, updated);
      },
      deepCopy
    );
  }
}

export type LingGenMatch = 'match' | 'conflict' | 'common';

function parseLingGen(lg?: string): string[] {
  const clean = (lg || '').replace(/灵根/g, '').trim();
  if (!clean) return [];
  return clean.split('');
}

export function getLingGenMatch(
  gf: Pick<GongFaType, 'lg'>,
  linggen: string
): LingGenMatch {
  const ls = parseLingGen(gf.lg);
  if (!ls.length) return 'common';
  return ls.includes(linggen) ? 'match' : 'conflict';
}

export function getLingGenExpRate(
  gf: Pick<GongFaType, 'lg'>,
  linggen: string
): number {
  const m = getLingGenMatch(gf, linggen);
  if (m === 'match') return 1.5;
  if (m === 'conflict') return 0.7;
  return 1;
}

export function getLingGenAttrRate(
  gf: Pick<GongFaType, 'lg'>,
  linggen: string
): number {
  return getLingGenMatch(gf, linggen) === 'conflict' ? 0.8 : 1;
}

export function getEffectiveAttr(
  gf: GongFaType,
  linggen: string
): Partial<ActorDataConfigForZhanDou> {
  const attrRate = getLingGenAttrRate(gf, linggen);
  const result: Partial<ActorDataConfigForZhanDou> = {};
  if (gf.attr) {
    (Object.keys(gf.attr) as (keyof ActorDataConfigForZhanDou)[])
      .filter((k) => k !== 'xianyuan')
      .forEach((key) => {
        const v = gf.attr[key] || 0;
        if (v) {
          result[key] = Math.round(v * attrRate * 10) / 10;
        }
      });
  }
  return result;
}

/**
 * @description: 设置当前功法
 * @param {string} id
 * @return {*}
 */
function setCurrentGongFa(id: string): void {
  const { set } = useActorStore.getState();
  const { current } = useStore.getState();
  const acData = getActor();
  const gf = get(id);
  if (!gf) return;

  const updated = cloneDeep(acData);
  const { linggen } = updated;

  if (updated.gongfa.current) {
    const currentGongFa = updated.gongfa.current;
    const elapsedMs = currentGongFa.time
      ? Math.max(0, Date.now() - currentGongFa.time)
      : 0;
    const timeArr = new TimeArray(elapsedMs);
    const addExp =
      timeArr.toZhouTian() * 1000 * getLingGenExpRate(currentGongFa, linggen);
    currentGongFa.exp += addExp;
    currentGongFa.time = Date.now();
    const currentAdds = getEffectiveAttr(currentGongFa, linggen);
    (Object.keys(currentAdds) as (keyof ActorDataConfigForZhanDou)[]).forEach(
      (key) => {
        const k = key as keyof AddAttrType;
        updated.addAttr[k] =
          (updated.addAttr[k] || 0) - (currentAdds[key] || 0);
      }
    );
    const existingIndex = updated.gongfa.ls.findIndex(
      (v) => v.id === currentGongFa.id
    );
    if (existingIndex === -1) {
      updated.gongfa.ls.push(currentGongFa);
    } else {
      updated.gongfa.ls[existingIndex] = currentGongFa;
    }
  }

  updated.gongfa.ls = updated.gongfa.ls.filter((v) => v.id !== gf.id);
  const newGongfa = { ...gf, time: Date.now() };
  updated.gongfa.current = newGongfa;

  const adds = getEffectiveAttr(newGongfa, linggen);
  (Object.keys(adds) as (keyof ActorDataConfigForZhanDou)[]).forEach((key) => {
    const k = key as keyof AddAttrType;
    updated.addAttr[k] = (updated.addAttr[k] || 0) + (adds[key] || 0);
  });
  set(current, updated);
}

/**
 * @description: 卸下当前功法
 * @return {*}
 */
function putCurrentGongfa(): Promise<boolean> {
  const { set } = useActorStore.getState();
  const { current } = useStore.getState();
  const acData = getActor();
  const currentGongFa = acData.gongfa.current;
  let state = false;
  if (currentGongFa) {
    const updated = cloneDeep(acData);
    const gf = updated.gongfa.current;
    const { linggen } = updated;
    const elapsedMs = gf?.time ? Math.max(0, Date.now() - gf.time) : 0;
    const timeArr = new TimeArray(elapsedMs);
    const addExp =
      timeArr.toZhouTian() * 1000 * getLingGenExpRate(gf!, linggen);
    gf!.exp += addExp;
    const existingIndex = updated.gongfa.ls.findIndex((v) => v.id === gf!.id);
    if (existingIndex === -1) {
      updated.gongfa.ls.push(gf!);
    } else {
      updated.gongfa.ls[existingIndex] = gf!;
    }
    updated.gongfa.current = null;
    state = true;
    const adds = getEffectiveAttr(gf!, linggen);
    (Object.keys(adds) as (keyof ActorDataConfigForZhanDou)[]).forEach(
      (key) => {
        const k = key as keyof AddAttrType;
        updated.addAttr[k] = (updated.addAttr[k] || 0) - (adds[key] || 0);
      }
    );
    set(current, updated);
  } else {
    set(current, acData);
  }
  return Promise.resolve(state);
}

export { get, add, setCurrentGongFa, putCurrentGongfa };
export default {};
