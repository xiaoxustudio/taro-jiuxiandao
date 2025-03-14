import { ActorIdents } from '@/consts';
import { ActorDataConfig } from '@/types';
import { omit } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          const om = omit(state.actors, oArray.concat(ActorIdents));
          state.actors = om;
          return state;
        })
    }),
    {
      name: 'actor'
    }
  )
);

export default useActorStore;
