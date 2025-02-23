import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { ActorDataConfig } from '@/types';
import { cloneDeep } from 'lodash-es';
import { useCallback, useMemo } from 'react';

/**
 * @description: 当前角色控制器
 * @return {*}
 */
function useActorController() {
  const { current } = useStore();
  const { set: setActor, ...store } = useActorStore();
  const actor = useMemo(() => store[current], [current, store]);

  if (!actor) {
    throw new Error('无法读取存档');
  } else if (current === 'set') {
    throw new Error('无法读取存档(set)');
  }

  /**
   * @description: 获取属性
   * @return {*}
   */
  const get = useCallback(
    (name: keyof ActorDataConfig) => {
      return actor[name] as any;
    },
    [actor]
  );

  /**
   * @description: 设置属性
   * @return {*}
   */
  const set = useCallback(
    (key: keyof ActorDataConfig, val: any) => {
      const newActor = cloneDeep(actor) as ActorDataConfig;
      newActor[key as any] = val;
      setActor(current, actor);
    },
    [actor, current, setActor]
  );

  const obj = useMemo(() => ({ get, set }), [get, set]);
  return obj;
}
export default useActorController;
