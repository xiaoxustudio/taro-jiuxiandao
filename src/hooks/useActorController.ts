import { cloneDeep, omit } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { ActorIdents } from '@/consts';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { ActorDataConfig, NestedKeyOf } from '@/types';

/**
 * @description: 当前角色控制器
 * @return {*}
 */
function useActorController() {
  const { current } = useStore();
  const { actors } = useActorStore();
  const actor = useMemo(() => actors[current], [current, actors]);

  if (!actor) {
    throw new Error('无法读取存档');
  } else if (ActorIdents.includes(current)) {
    throw new Error('无法读取存档(identifier)');
  }

  /**
   * @description: 获取属性（支持嵌套路径如 "a.b" 和单层键如 "a"）
   */
  const get = useCallback(
    (key: NestedKeyOf<ActorDataConfig>, defaultValue: any = null) => {
      // 合法性校验
      if (/\s/.test(key)) {
        throw new Error('Key 包含非法空格');
      }

      const pathParts = key.split('.');
      let currentValue: any = actor;

      // eslint-disable-next-line no-restricted-syntax
      for (const part of pathParts) {
        if (currentValue === null || currentValue === undefined) {
          return defaultValue;
        }
        currentValue = currentValue[part];
      }

      return currentValue ?? defaultValue;
    },
    [actor]
  );

  /**
   * @description: 设置属性（支持嵌套路径如 "a.b" 和单层键如 "a"）
   */
  const set = useCallback((key: NestedKeyOf<ActorDataConfig>, val: any) => {
    // 合法性校验
    if (/\s/.test(key)) {
      throw new Error('Key 包含非法空格');
    }

    useActorStore.setState((state) => {
      const { current: curr } = useStore.getState();
      const currentActor = state.actors[curr];

      // 深拷贝当前角色数据
      const newActor = cloneDeep(currentActor) as ActorDataConfig;
      const pathParts = key.split('.');
      let target: any = newActor;

      // 逐层处理路径
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        if (!target[part]) {
          target[part] = {};
        } else if (typeof target[part] !== 'object') {
          throw new Error(
            `路径 ${pathParts.slice(0, i + 1).join('.')} 不是对象`
          );
        }

        target = target[part];
      }

      // 设置最终值
      const lastKey = pathParts[pathParts.length - 1];
      target[lastKey] = val;

      // 更新整个角色数据
      return {
        ...state,
        actors: {
          ...state.actors,
          [curr]: newActor // 确保更新完整对象
        }
      };
    });
  }, []);

  const OmitActor = useMemo(() => omit(actor, ActorIdents), [actor]);

  const obj = useMemo(
    () => ({ get, set, actor: OmitActor }),
    [OmitActor, get, set]
  );

  return obj;
}

export default useActorController;
