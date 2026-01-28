import { omit } from 'lodash-es';
import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActorDataConfig } from '@/types';
import { ActorIdents } from '@/consts';

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
            keys.forEach((k) => {
              try {
                Taro.removeStorageSync(k);
              } catch (e) {
                String(e);
              }
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
              'danfangData'
            ])
          ])
        ) as Record<string, ActorDataConfig>
      })
    }
  )
);

export default useActorStore;
