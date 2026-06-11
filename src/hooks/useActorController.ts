import { cloneDeep, omit } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';
import { ActorIdents } from '@/consts';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import useStorageStore from '@/store/storage';
import { ActorDataConfig, NestedKeyOf } from '@/types';
import { GongFaType } from '@/types/gongfa';

/**
 * @description: 当前角色控制器
 * @return {*}
 */
function useActorController() {
  const { current, set: setCurrent } = useStore();
  const { actors } = useActorStore();
  const actorKeys = useMemo(
    () => Object.keys(actors).filter((key) => !ActorIdents.includes(key)),
    [actors]
  );
  const resolvedKey = useMemo(() => {
    if (current && !ActorIdents.includes(current) && actors[current]) {
      return current;
    }
    return actorKeys[0] || '';
  }, [actorKeys, actors, current]);
  const actor = useMemo(
    () => (resolvedKey ? actors[resolvedKey] : undefined),
    [resolvedKey, actors]
  );

  useEffect(() => {
    if (
      (!current || ActorIdents.includes(current) || !actors[current]) &&
      resolvedKey &&
      resolvedKey !== current
    ) {
      setCurrent(resolvedKey);
    }
  }, [actors, current, resolvedKey, setCurrent]);

  useEffect(() => {
    if (!actor) return;
    const { get: load } = useStorageStore.getState();

    const run = async () => {
      const patch: Partial<ActorDataConfig> = {};

      // 加载材料池
      if (!actor.materialPoolByGrade && actor.materialPoolStorageKey) {
        const loaded = await load(actor.materialPoolStorageKey);
        if (loaded) patch.materialPoolByGrade = loaded;
      }
      if (
        !actor.materialPoolByGrade &&
        actor.materialPoolStorageKeysByGrade &&
        Object.keys(actor.materialPoolStorageKeysByGrade).length
      ) {
        const next: Record<string, { name: string; itype: string }[]> = {};
        await Promise.all(
          Object.entries(actor.materialPoolStorageKeysByGrade).map(
            async ([grade, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              if (loaded.length && typeof loaded[0] === 'string') {
                next[grade] = (loaded as string[]).map((name) => ({
                  name,
                  itype: grade
                }));
              } else {
                next[grade] = loaded as any;
              }
            }
          )
        );
        if (Object.keys(next).length) {
          patch.materialPoolByGrade = next as any;
        }
      }
      // 加载功法池
      if (!actor.danfangPoolByGrade && actor.danfangPoolStorageKey) {
        const loaded = await load(actor.danfangPoolStorageKey);
        if (loaded) patch.danfangPoolByGrade = loaded;
      }
      if (
        !actor.danfangPoolByGrade &&
        actor.danfangPoolStorageKeysByGrade &&
        Object.keys(actor.danfangPoolStorageKeysByGrade).length
      ) {
        const next: Record<string, any[]> = {};
        await Promise.all(
          Object.entries(actor.danfangPoolStorageKeysByGrade).map(
            async ([grade, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[grade] = loaded as any[];
            }
          )
        );
        if (Object.keys(next).length) {
          patch.danfangPoolByGrade = next;
        }
      }
      if (
        !actor.gongfaPoolByGrade &&
        actor.gongfaPoolStorageKeysByGrade &&
        Object.keys(actor.gongfaPoolStorageKeysByGrade).length
      ) {
        const next: Record<string, GongFaType[]> = {};
        await Promise.all(
          Object.entries(actor.gongfaPoolStorageKeysByGrade).map(
            async ([grade, key]) => {
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[grade] = loaded as GongFaType[];
            }
          )
        );
        if (Object.keys(next).length) {
          patch.gongfaPoolByGrade = next;
        }
      }
      if (!actor.danfangData && actor.danfangDataStorageKey) {
        const loaded = await load(actor.danfangDataStorageKey);
        if (loaded) patch.danfangData = loaded;
      }
      if (!actor.seedRegistry && actor.seedRegistryStorageKey) {
        const loaded = await load(actor.seedRegistryStorageKey);
        if (loaded) patch.seedRegistry = loaded;
      }

      if (!Object.keys(patch).length) return;

      useActorStore.setState((state) => {
        const { current: curr } = useStore.getState();
        const currentActor = state.actors[curr];
        if (!currentActor) return state;
        return {
          ...state,
          actors: {
            ...state.actors,
            [curr]: { ...currentActor, ...patch }
          }
        };
      });
    };

    run();
  }, [actor]);

  /**
   * @description: 获取属性（支持嵌套路径如 "a.b" 和单层键如 "a"）
   */
  const safeActor = useMemo(() => actor ?? ({} as ActorDataConfig), [actor]);
  const get = useCallback(
    (key: NestedKeyOf<ActorDataConfig>, defaultValue: any = null) => {
      // 合法性校验
      if (/\s/.test(key)) {
        throw new Error('Key 包含非法空格');
      }

      const pathParts = key.split('.');
      let currentValue: any = safeActor;

      // eslint-disable-next-line no-restricted-syntax
      for (const part of pathParts) {
        if (currentValue === null || currentValue === undefined) {
          return defaultValue;
        }
        currentValue = currentValue[part];
      }

      return currentValue ?? defaultValue;
    },
    [safeActor]
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
      if (!currentActor) return state;

      // 深拷贝当前角色数据
      const newActor = cloneDeep(currentActor) as ActorDataConfig;
      const pathParts = key.split('.');
      let copyActorTarget = newActor;

      // 逐层处理路径
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        if (!copyActorTarget[part]) {
          copyActorTarget[part] = {};
        } else if (typeof copyActorTarget[part] !== 'object') {
          throw new Error(
            `路径 ${pathParts.slice(0, i + 1).join('.')} 不是对象`
          );
        }

        copyActorTarget = copyActorTarget[part];
      }

      // 设置最终值
      const lastKey = pathParts[pathParts.length - 1];
      copyActorTarget[lastKey] = val;

      if (key === 'danfangData') {
        const storageKey = `actor:${newActor.uuid}:danfangData`;
        try {
          const { set: setStorage } = useStorageStore.getState();
          setStorage(storageKey, val).catch(
            // eslint-disable-next-line no-console
            (e) => console.error('Failed to save danfangData:', e)
          );
          newActor.danfangDataStorageKey = storageKey;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to save danfangData:', e);
        }
      }
      if (key === 'seedRegistry') {
        const storageKey = `actor:${newActor.uuid}:seedRegistry`;
        try {
          const { set: setStorage } = useStorageStore.getState();
          setStorage(storageKey, val).catch(
            // eslint-disable-next-line no-console
            (e) => console.error('Failed to save seedRegistry:', e)
          );
          newActor.seedRegistryStorageKey = storageKey;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to save seedRegistry:', e);
        }
      }

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

  const OmitActor = useMemo(() => omit(safeActor, ActorIdents), [safeActor]);

  const obj = useMemo(
    () => ({ get, set, actor: OmitActor }),
    [OmitActor, get, set]
  );

  return obj;
}

export default useActorController;
