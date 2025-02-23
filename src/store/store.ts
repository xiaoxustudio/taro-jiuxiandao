import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreParams {
  current: string;
  set: (newVal: string) => void;
}

const useStore = create<StoreParams>()(
  persist(
    (set) => ({
      current: '',
      set: (val: string) => set((state) => ({ ...state, current: val })),
    }),
    {
      name: 'store',
    }
  )
);

export default useStore;
