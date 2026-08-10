import omit from 'lodash-es/omit';
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
 * @description: 获取当前角色的功法列表
 * @return {*}
 */
function getList(): GongFaType[] {
  const acData = getActor();
  return acData.gongfa.ls;
}

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
 * @description: 移除指定功法（按 name 或 id）
 * @param {*} param0
 * @return {*}
 */
function remove({ name, id }: { name?: string; id?: string }) {
  const { set } = useActorStore.getState();
  const { current } = useStore.getState();
  const acData = cloneDeep(getActor());
  if (name) {
    acData.gongfa.ls = acData.gongfa.ls.filter((v) => v.name !== name);
  } else if (id) {
    acData.gongfa.ls = acData.gongfa.ls.filter((v) => v.id !== id);
  }
  set(current, acData);
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
      (key: string, value: any) => {
        const updated = cloneDeep(deepCopy);
        (updated as any)[key] = value;
        set(current, updated);
      },
      deepCopy
    );
  }
}

type GongFaTypeEx = GongFaType & { update: () => void };

/**
 * @description: 获取带 update 方法的功法对象（用于就地保存更新）
 * @param {string} id
 * @return {*}
 */
function update(id: string) {
  const gf = get(id);
  if (gf)
    return {
      ...gf,
      update(this: GongFaTypeEx) {
        add(omit(this, 'update') as GongFaType);
      }
    } as GongFaTypeEx;
  return null;
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

  if (updated.gongfa.current) {
    const currentGongFa = updated.gongfa.current;
    const elapsedMs = currentGongFa.time
      ? Math.max(0, Date.now() - currentGongFa.time)
      : 0;
    const timeArr = new TimeArray(elapsedMs);
    const addExp = timeArr.toZhouTian() * 1000;
    currentGongFa.exp += addExp;
    currentGongFa.time = Date.now();
    const currentAdds = currentGongFa.attr;
    if (currentAdds) {
      (Object.keys(currentAdds) as (keyof ActorDataConfigForZhanDou)[])
        .filter((k) => k !== 'xianyuan')
        .forEach((key) => {
          const k = key as keyof AddAttrType;
          updated.addAttr[k] =
            (updated.addAttr[k] || 0) - (currentAdds[key] || 0);
        });
    }
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

  const adds = newGongfa.attr;
  if (adds) {
    (Object.keys(adds) as (keyof ActorDataConfigForZhanDou)[])
      .filter((k) => k !== 'xianyuan')
      .forEach((key) => {
        const k = key as keyof AddAttrType;
        updated.addAttr[k] = (updated.addAttr[k] || 0) + (adds[key] || 0);
      });
  }
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
    const elapsedMs = gf?.time ? Math.max(0, Date.now() - gf.time) : 0;
    const timeArr = new TimeArray(elapsedMs);
    const addExp = timeArr.toZhouTian() * 1000;
    gf!.exp += addExp;
    const existingIndex = updated.gongfa.ls.findIndex((v) => v.id === gf!.id);
    if (existingIndex === -1) {
      updated.gongfa.ls.push(gf!);
    } else {
      updated.gongfa.ls[existingIndex] = gf!;
    }
    updated.gongfa.current = null;
    state = true;
    const adds = gf!.attr;
    if (adds) {
      (Object.keys(adds) as (keyof ActorDataConfigForZhanDou)[])
        .filter((k) => k !== 'xianyuan')
        .forEach((key) => {
          const k = key as keyof AddAttrType;
          updated.addAttr[k] = (updated.addAttr[k] || 0) - (adds[key] || 0);
        });
    }
    set(current, updated);
  } else {
    set(current, acData);
  }
  return Promise.resolve(state);
}

export {
  getList,
  get,
  remove,
  add,
  update,
  setCurrentGongFa,
  putCurrentGongfa
};
export default {};
