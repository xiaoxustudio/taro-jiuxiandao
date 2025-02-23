import { ActorDataConfig } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActorStore {
  //@ts-expect-error
  set: (store: string, newVal: ActorDataConfig) => void;
  [K: string]: ActorDataConfig;
}

// 存档角色
const useActorStore = create<ActorStore>()(
  persist(
    (set) => ({
      ...({
        set: (store, val) => set((state) => ({ ...state, [store]: val })),
      } as ActorStore),
    }),
    {
      name: 'actor',
    }
  )
);

export default useActorStore;
