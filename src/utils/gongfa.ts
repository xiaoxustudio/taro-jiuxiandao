import omit from 'lodash-es/omit';
import { GongFaType } from '@/types/gongfa';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { getActor } from './actor';
import TimeArray from './TimeArray';

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
function add(gf: GongFaType, replace = false) {
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
  if (acData.gongfa.current || !gf) return; // 已存在功法 or gf 不存在
  remove(gf);
  gf.time = Date.now();
  acData.gongfa.current = gf;
  // 增加或减少属性
  const adds = gf.attr;
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
    const timeArr = currentGongFa?.time
      ? new TimeArray(currentGongFa.time)
      : new TimeArray(Date.now());
    const addExp = timeArr.toZhouTian() * 1000;
    currentGongFa.exp += addExp;
    add(currentGongFa);
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
