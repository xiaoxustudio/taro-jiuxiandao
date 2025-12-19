import omit from 'lodash-es/omit';
import { GongFaType } from '@/types/gongfa';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { getActor } from './actor';
import TimeArray from './TimeArray';

/* 功法相关 */

function getList(): GongFaType[] {
  const acData = getActor();
  return acData.gongfa.ls;
}

function get(id: string): GongFaType | undefined {
  const acData = getActor();
  return acData.gongfa.ls.find((v) => v.id === id);
}

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
      if (adds[key] >= 0) {
        acData.addAttr[key] += adds[key];
      } else {
        acData.addAttr[key] -= adds[key];
      }
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
        if (adds[key] >= 0) {
          acData.addAttr[key] -= adds[key];
        } else {
          acData.addAttr[key] += adds[key];
        }
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
