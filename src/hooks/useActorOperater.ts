// hooks/useActorOperater.ts
import { omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { ActorIdents } from '@/consts';
import useActorStore from '@/store/actor';
import { ActorDataConfig } from '@/types';

type ActorOperater = {
  /** 删除角色 */
  // eslint-disable-next-line no-unused-vars
  delete: (name: string) => void;
  /** 获取单个角色数据 */
  // eslint-disable-next-line no-unused-vars
  get: <T = ActorDataConfig>(name: string) => T | null;
  /** 获取所有非受保护角色数据 */
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
  /**
   * 安全删除角色（包含受保护角色校验）
   */
  const deleteActor = useCallback((name: string) => {
    if (ActorIdents.includes(name)) {
      throw new Error(`[useActorOperater] 受保护角色关键字无法删除: ${name}`);
    }
    // 只保留一次状态更新
    useActorStore.setState((state) => {
      const actor = state.actors;
      const newActor = omit(actor, [name]);
      state.actors = newActor;
      return state;
    });
  }, []);

  /**
   * 获取角色最新数据（绕过闭包问题）
   */
  const get = useCallback(<T = ActorDataConfig>(name: string): T | null => {
    return (useActorStore.getState().actors[name] as T) ?? null;
  }, []);

  /**
   * 获取过滤后的角色列表（排除系统预留角色）
   */
  const getAll = useCallback((): Record<string, ActorDataConfig> => {
    return omit(useActorStore.getState().actors, ActorIdents);
  }, []);

  // 稳定返回值引用（避免不必要的组件重渲染）
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
