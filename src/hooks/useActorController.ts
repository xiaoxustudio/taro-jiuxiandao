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
  const actor = store[current];

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
      try {
        return actor[name] as any;
      } catch {
        return null;
      }
    },
    [actor]
  );

  /**
   * @description: 设置属性
   * @return {*}
   */
  const set = useCallback((key: keyof ActorDataConfig, val: any) => {
    const { current: curr } = useStore.getState();
    const storeData = useActorStore.getState();
    const newActor = cloneDeep(storeData[curr]) as ActorDataConfig;
    newActor[key as any] = val;
    useActorStore.setState({ [curr]: newActor });
  }, []);

  const obj = useMemo(() => ({ get, set }), [get, set]);

  return obj;
}
export default useActorController;
