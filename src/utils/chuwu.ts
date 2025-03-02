import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { BaseType, CWType } from '@/types';
import { getActor } from './actor';
// 角色储物

export interface AddProps extends BaseType {
  name: string;
  type: CWType;
  num: number;
}

function TR(type: CWType) {
  switch (type) {
    case CWType.CL:
      return 'cl';
    case CWType.DJ:
      return 'dj';
    case CWType.WP:
      return 'wp';
    default:
      return 'wp';
  }
}

/**
 * @description: 是否有该物品
 * @param {object} param1
 * @return {*}
 */
function Has({ name, type = CWType.WP }: { name: string; type: CWType }) {
  const acData = getActor();
  const cw = acData.cw[TR(type)];
  let index = -1;
  cw.some((v: BaseType, ind) => {
    index = ind;
    return v.name === name;
  });
  return index;
}

/**
 * @description: 添加物品
 * @param {AddProps} param1
 * @return {*}
 */
function Add({ name, type = CWType.WP, num = 1, isPile = false }: AddProps) {
  const { current } = useStore.getState();
  const acData = getActor();
  const { set } = useActorStore.getState();
  if (!isPile) {
    num = 1;
  }
  const has = Has({ name, type });
  switch (type) {
    case CWType.WP:
      if (~has) {
        acData.cw.wp[has].num += num;
      } else {
        acData.cw.wp.push({
          name,
          isPile,
          type: CWType.WP,
          num,
        });
      }
      break;
  }
  set(current, acData);
  return;
}

export default { Add, Has, getActor, TR };
