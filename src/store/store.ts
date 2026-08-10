import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/services/storage';

interface StoreParams {
  current: string; // 当前选择的存档
  set: (newVal: string) => void;
}

const useStore = create<StoreParams>()(
  persist(
    (set) => ({
      current: '',
      set: (val: string) => set((state) => ({ ...state, current: val }))
    }),
    {
      name: 'store',
      storage: createJSONStorage(createPersistStorage),
      version: 1
    }
  )
);

export default useStore;
