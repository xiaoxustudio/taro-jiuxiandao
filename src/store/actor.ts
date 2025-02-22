import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActorStore {
  set: (newVal: any) => void;
  [key: string]: any;
}

// 存档角色
const useActorStore = create<ActorStore>()(
  persist((set) => ({ set: (val: any) => set({ ...val }) }), {
    name: "actor",
  })
);
export default useActorStore;
