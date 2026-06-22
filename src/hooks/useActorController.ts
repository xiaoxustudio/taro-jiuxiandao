import { cloneDeep } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import useStorageStore from '@/services/storage';
import { ActorDataConfig } from '@/types';
import { GongFaType } from '@/types/gongfa';

/**
 * @description: 当前角色控制器
 * @return {*}
 */
function useActorController() {
  const { current, set: setCurrent } = useStore();
  const { actors } = useActorStore();
  const actorKeys = useMemo(() => Object.keys(actors), [actors]);
  const resolvedKey = useMemo(() => {
    if (current && actors[current]) {
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
      (!current || !actors[current]) &&
      resolvedKey &&
      resolvedKey !== current
    ) {
      setCurrent(resolvedKey);
    }
  }, [actors, current, resolvedKey, setCurrent]);

  const loadingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!actor || !resolvedKey) return undefined;
    if (loadingRef.current === resolvedKey) return undefined;
    loadingRef.current = resolvedKey;

    const { get: load } = useStorageStore.getState();
    let cancelled = false;

    const run = async () => {
      const patch: Partial<ActorDataConfig> = {};

      if (!actor.materialPoolByGrade && actor.materialPoolStorageKey) {
        const loaded = await load(actor.materialPoolStorageKey);
        if (!cancelled && loaded) patch.materialPoolByGrade = loaded;
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
              if (cancelled) return;
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
        if (!cancelled && Object.keys(next).length) {
          patch.materialPoolByGrade = next as any;
        }
      }
      if (!actor.danfangPoolByGrade && actor.danfangPoolStorageKey) {
        const loaded = await load(actor.danfangPoolStorageKey);
        if (!cancelled && loaded) patch.danfangPoolByGrade = loaded;
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
              if (cancelled) return;
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[grade] = loaded as any[];
            }
          )
        );
        if (!cancelled && Object.keys(next).length) {
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
              if (cancelled) return;
              const loaded = await load(key);
              if (!Array.isArray(loaded)) return;
              next[grade] = loaded as GongFaType[];
            }
          )
        );
        if (!cancelled && Object.keys(next).length) {
          patch.gongfaPoolByGrade = next;
        }
      }
      if (!actor.danfangData && actor.danfangDataStorageKey) {
        const loaded = await load(actor.danfangDataStorageKey);
        if (!cancelled && loaded) patch.danfangData = loaded;
      }
      if (!actor.seedRegistry && actor.seedRegistryStorageKey) {
        const loaded = await load(actor.seedRegistryStorageKey);
        if (!cancelled && loaded) patch.seedRegistry = loaded;
      }

      if (!actor.xiulianbeilv) {
        patch.xiulianbeilv = 10;
      }

      if (cancelled || !Object.keys(patch).length) return;

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
    return () => {
      cancelled = true;
    };
  }, [actor, resolvedKey]);

  /**
   * @description: 获取属性（支持嵌套路径如 "a.b" 和单层键如 "a"）
   */
  const safeActor = useMemo(() => actor ?? ({} as ActorDataConfig), [actor]);
  const get = useCallback(
    (key: string, defaultValue: any = null) => {
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

  const persistStorage = useCallback((key: string, val: any, uuid: string) => {
    const storageKeyMap: Record<string, string> = {
      danfangData: `actor:${uuid}:danfangData`,
      seedRegistry: `actor:${uuid}:seedRegistry`
    };
    const storageKey = storageKeyMap[key];
    if (!storageKey) return undefined;
    const { set: setStorage } = useStorageStore.getState();
    setStorage(storageKey, val).catch((e: any) =>
      console.error(`Failed to save ${key}:`, e)
    );
    return storageKey;
  }, []);

  /**
   * @description: 设置属性（支持嵌套路径如 "a.b" 和单层键如 "a"）
   */
  const set = useCallback(
    (key: string, val: any) => {
      if (/\s/.test(key)) {
        throw new Error('Key 包含非法空格');
      }

      let storageKeyToSave: string | undefined;

      useActorStore.setState((state) => {
        const { current: curr } = useStore.getState();
        const currentActor = state.actors[curr];
        if (!currentActor) return state;

        const newActor = cloneDeep(currentActor) as ActorDataConfig;
        const pathParts = key.split('.');
        let copyActorTarget: any = newActor;

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

        const lastKey = pathParts[pathParts.length - 1];
        copyActorTarget[lastKey] = val;

        if (key === 'danfangData' || key === 'seedRegistry') {
          storageKeyToSave = persistStorage(key, val, newActor.uuid);
          if (storageKeyToSave) {
            const storageField = `${key}StorageKey` as keyof ActorDataConfig;
            (newActor as any)[storageField] = storageKeyToSave;
          }
        }

        return {
          ...state,
          actors: {
            ...state.actors,
            [curr]: newActor
          }
        };
      });
    },
    [persistStorage]
  );

  const obj = useMemo(
    () => ({ get, set, actor: safeActor }),
    [safeActor, get, set]
  );

  return obj;
}

export default useActorController;
