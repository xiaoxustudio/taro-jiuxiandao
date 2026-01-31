import { omit } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActorDataConfig } from '@/types';
import { ActorIdents } from '@/consts';
import useStorageStore from '@/store/storage';

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
            const actor = state.actors[name] as any;
            if (!actor) return;
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
              keys.push(
                ...(Object.values(
                  actor.materialPoolStorageKeysByGrade
                ) as string[])
              );
            }
            if (actor.danfangPoolStorageKeysByGrade) {
              keys.push(
                ...(Object.values(
                  actor.danfangPoolStorageKeysByGrade
                ) as string[])
              );
            }
            if (actor.gongfaPoolStorageKeysByGrade) {
              keys.push(
                ...(Object.values(
                  actor.gongfaPoolStorageKeysByGrade
                ) as string[])
              );
            }
            keys.forEach((k) => {
              const { remove } = useStorageStore.getState();
              remove(k).catch((e: any) => String(e));
            });
          });
          const om = omit(state.actors, oArray.concat(ActorIdents));
          state.actors = om;
          return state;
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
