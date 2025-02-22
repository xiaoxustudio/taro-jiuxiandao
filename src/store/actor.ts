import { ActorDataConfig } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActorStore {
	set: (store: string, newVal: ActorDataConfig) => void;
	[key: string]:
		| ActorDataConfig
		| ((store: string, newVal: ActorDataConfig) => void);
}

// 存档角色
const useActorStore = create<ActorStore>()(
	persist(
		(set) => ({
			set: (store: string, val: ActorDataConfig) =>
				set((state) => ({ ...state, ...{ [store]: val } })),
		}),
		{
			name: 'actor',
		}
	)
);
export default useActorStore;
