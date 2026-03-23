import Taro from '@tarojs/taro';
import { create } from 'zustand';

type StorageValue = any;

interface StorageStore {
  parse: (raw: any) => StorageValue | undefined;
  get: (key?: string) => Promise<StorageValue | undefined>;
  getSync: (key?: string) => StorageValue | undefined;
  set: (key: string, data: StorageValue) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

const parseStored = (raw: any) => {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

const useStorageStore = create<StorageStore>(() => {
  const anyTaro = Taro as any;
  return {
    parse: parseStored,
    getSync: (key?: string) => {
      if (!key) return undefined;
      let raw: any;
      if (typeof anyTaro.getStorageSync === 'function') {
        raw = anyTaro.getStorageSync(key);
      } else if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(key);
      } else {
        return undefined;
      }
      return parseStored(raw);
    },
    get: async (key?: string) => {
      if (!key) return undefined;
      let raw: any;
      if (typeof anyTaro.getStorageSync === 'function') {
        raw = anyTaro.getStorageSync(key);
      } else if (typeof anyTaro.getStorage === 'function') {
        try {
          const res = await anyTaro.getStorage({ key });
          raw = res?.data;
        } catch (e) {
          String(e);
          return undefined;
        }
      } else if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(key);
      } else {
        return undefined;
      }
      return parseStored(raw);
    },
    set: async (key: string, data: StorageValue) => {
      if (!key) return;
      if (typeof anyTaro.setStorageSync === 'function') {
        anyTaro.setStorageSync(key, data);
        return;
      }
      if (typeof anyTaro.setStorage === 'function') {
        await anyTaro.setStorage({ key, data });
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    },
    remove: async (key: string) => {
      if (!key) return;
      if (typeof anyTaro.removeStorageSync === 'function') {
        anyTaro.removeStorageSync(key);
        return;
      }
      if (typeof anyTaro.removeStorage === 'function') {
        await anyTaro.removeStorage({ key });
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
});

export default useStorageStore;
