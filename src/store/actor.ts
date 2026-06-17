import { omit } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActorDataConfig } from '@/types';
import { ActorIdents } from '@/config';
import useStorageStore from '@/services/storage';

interface ActorStore {
  set: (store: string, newVal: ActorDataConfig) => void;
  remove: (store: string | string[]) => void;
  actors: { [K: string]: ActorDataConfig };
}

// 存档角色
const useActorStore = create<ActorStore>()(
  persist(
    (set) => ({
      actors: {},
      set: (store, val) =>
        set((state) => ({
          ...state,
          actors: { ...state.actors, [store]: val }
        })),
      remove: (store) =>
        set((state) => {
          const oArray = Array.isArray(store) ? [...store] : [store];
          oArray.forEach((name) => {
            if (ActorIdents.includes(name)) return;
            const actor = state.actors[name];
            if (!actor) return;
            // 当执行删除角色时，同时删除他们的生成的数据
            const keys: string[] = [];
            if (actor.materialPoolStorageKey)
              keys.push(actor.materialPoolStorageKey);
            if (actor.danfangPoolStorageKey)
              keys.push(actor.danfangPoolStorageKey);
            if (actor.danfangDataStorageKey)
              keys.push(actor.danfangDataStorageKey);
            if (actor.seedRegistryStorageKey)
              keys.push(actor.seedRegistryStorageKey);
            if (actor.materialPoolStorageKeysByGrade) {
              keys.push(...Object.values(actor.materialPoolStorageKeysByGrade));
            }
            if (actor.danfangPoolStorageKeysByGrade) {
              keys.push(...Object.values(actor.danfangPoolStorageKeysByGrade));
            }
            if (actor.gongfaPoolStorageKeysByGrade) {
              keys.push(...Object.values(actor.gongfaPoolStorageKeysByGrade));
            }
            keys.forEach((k) => {
              const { remove } = useStorageStore.getState();
              remove(k).catch(
                // eslint-disable-next-line no-console
                (e) => console.error('Failed to remove storage key:', e)
              );
            });
          });
          const om = omit(state.actors, oArray.concat(ActorIdents));
          return {
            ...state,
            actors: om
          };
        })
    }),
    {
      name: 'actor',
      partialize: (state) => ({
        actors: Object.fromEntries(
          Object.entries(state.actors).map(([key, actor]) => [
            key,
            omit(actor as any, [
              'materialPoolByGrade',
              'danfangPoolByGrade',
              'danfangData',
              'gongfaPoolByGrade',
              'seedRegistry'
            ])
          ])
        ) as Record<string, ActorDataConfig>
      })
    }
  )
);

export default useActorStore;
