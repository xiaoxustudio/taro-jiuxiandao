import useActorStore from '@/store/actor';
import useStore from '@/store/store';

/**
 * @description: 获取当前角色数据
 * @return {*}
 */
function getActor() {
  const { current } = useStore.getState();
  const actor = useActorStore.getState();
  const acData = actor[current];
  return acData;
}

/**
 * @description: 判断是否有该角色
 * @param {string} name
 * @return {*}
 */
function HasActor(name: string) {
  const actor = useActorStore.getState();
  const acData = actor[name];
  return !!acData;
}

export { getActor, HasActor };

