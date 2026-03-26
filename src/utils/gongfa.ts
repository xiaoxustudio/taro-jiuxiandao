import omit from 'lodash-es/omit';
import { GongFaType } from '@/types/gongfa';
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
  const acData = getActor();
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
  const acData = getActor();
  if (acData.gongfa.ls.find((v) => v.id === gf.id)) return;
  if (replace) {
    acData.gongfa.ls = acData.gongfa.ls.map((v) => (v.id === gf.id ? gf : v));
  } else {
    acData.gongfa.ls.push(gf);
  }
  set(current, acData);
  // 检查收集成就
  if (checkAchievement) {
    checkCollectionAchievements(
      (key: string) => acData[key],
      (key: string, value: any) => {
        acData[key] = value;
        set(current, acData);
      },
      acData
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

  // 如果已经穿戴了功法，先卸下当前功法
  if (acData.gongfa.current) {
    const currentGongFa = acData.gongfa.current;
    // 减少当前功法的属性
    const currentAdds = currentGongFa.attr;
    if (currentAdds) {
      Object.keys(currentAdds).forEach((key) => {
        acData.addAttr[key] -= currentAdds[key];
      });
    }
    // 将当前功法添加回列表（不触发remove操作）
    const existingIndex = acData.gongfa.ls.findIndex(
      (v) => v.id === currentGongFa.id
    );
    if (existingIndex === -1) {
      acData.gongfa.ls.push(currentGongFa);
    } else {
      acData.gongfa.ls[existingIndex] = currentGongFa;
    }
  }

  // 从列表中移除新功法并设置为当前功法
  acData.gongfa.ls = acData.gongfa.ls.filter((v) => v.id !== gf.id);
  // 创建新功法副本以避免引用问题
  const newGongfa = { ...gf, time: Date.now() };
  acData.gongfa.current = newGongfa;

  // 增加新功法的属性
  const adds = newGongfa.attr;
  if (adds) {
    Object.keys(adds).forEach((key) => {
      acData.addAttr[key] += adds[key];
    });
  }
  set(current, acData);
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
    const elapsedMs = currentGongFa?.time
      ? Math.max(0, Date.now() - currentGongFa.time)
      : 0;
    const timeArr = new TimeArray(elapsedMs);
    const addExp = timeArr.toZhouTian() * 1000;
    currentGongFa.exp += addExp;
    add(currentGongFa, false, false);
    acData.gongfa.current = null;
    state = true;
    // 增加或减少属性（+就是-，-就是+）
    const adds = currentGongFa.attr;
    if (adds) {
      Object.keys(adds).forEach((key) => {
        acData.addAttr[key] -= adds[key];
      });
    }
  }

  set(current, acData);
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
