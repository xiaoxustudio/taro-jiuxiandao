import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreParams {
	current: string;
	set: (newVal: any) => void;
}

const useStore = create<StoreParams>()(
	persist(
		(set) => ({
			current: '',
			set: (val: any) => set({ ...val }),
		}),
		{
			name: 'store',
		}
	)
);

export default useStore;
