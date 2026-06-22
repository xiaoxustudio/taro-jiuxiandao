// hooks/useActorOperater.ts
import { useCallback, useMemo } from 'react';
import useActorStore from '@/store/actor';
import { ActorDataConfig } from '@/types';

type ActorOperater = {
  /** 删除角色 */
  delete: (name: string) => void;
  /** 获取单个角色数据 */
  get: <T = ActorDataConfig>(name: string) => T | null;
  /** 获取所有角色数据 */
  getAll: () => Record<string, ActorDataConfig>;
};

/**
 * @description: 角色操作器 Hook
 * @example
 * const { get, delete: remove } = useActorOperater();
 * const player = get('player');
 * remove('npc1');
 */
function useActorOperater(): ActorOperater {
  const deleteActor = useCallback((name: string) => {
    useActorStore.setState((state) => {
      const { [name]: _removed, ...rest } = state.actors;
      return { ...state, actors: rest };
    });
  }, []);

  const get = useCallback(<T = ActorDataConfig>(name: string): T | null => {
    return (useActorStore.getState().actors[name] as T) ?? null;
  }, []);

  const getAll = useCallback((): Record<string, ActorDataConfig> => {
    return useActorStore.getState().actors;
  }, []);

  return useMemo(
    () => ({
      delete: deleteActor,
      get,
      getAll
    }),
    [deleteActor, get, getAll]
  );
}

export default useActorOperater;
