import useActorStore from '@/store/actor';
import useStore from '@/store/store';
import { ActorDataConfig } from '@/types';
import { useCallback, useMemo } from 'react';

export interface ActorControllerProps {
	storeName: string; // 存档名称
}

function useActorController({ storeName }: ActorControllerProps) {
	const { set: setActor, ...store } = useActorStore();
	const { current, set: setStore } = useStore();

	if (store[current]) {
		throw new Error('无法读取存档');
	} else if (current === 'set') {
		throw new Error('无法读取存档(set)');
	}

	setStore(storeName); // 设置当前存档

	/**
	 * @description: 获取存档属性
	 * @return {*}
	 */
	const get = useCallback(
		(name: string) => {
			return store[name] as ActorDataConfig;
		},
		[store]
	);

	/**
	 * @description: 设置存档属性
	 * @return {*}
	 */
	const set = useCallback(
		(key: string, val: string) => {
			const actor = get(current);
			actor[key] = val;
			setActor(current, actor);
		},
		[current, get, setActor]
	);

	const obj = useMemo(() => ({ get, set }), [get, set]);
	return obj;
}
export default useActorController;
