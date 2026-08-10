import Taro from '@tarojs/taro';
import { create } from 'zustand';

type StorageValue = unknown;

interface StorageStore {
  parse: (raw: unknown) => StorageValue | undefined;
  get: (key?: string) => Promise<StorageValue | undefined>;
  getSync: (key?: string) => StorageValue | undefined;
  set: (key: string, data: StorageValue) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

const parseStored = (raw: unknown) => {
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
  const taroApi = Taro;
  return {
    parse: parseStored,
    getSync: (key?: string) => {
      if (!key) return undefined;
      let raw: unknown;
      if (typeof taroApi.getStorageSync === 'function') {
        raw = taroApi.getStorageSync(key);
      } else if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(key);
      } else {
        return undefined;
      }
      return parseStored(raw);
    },
    get: async (key?: string) => {
      if (!key) return undefined;
      let raw: unknown;
      if (typeof taroApi.getStorageSync === 'function') {
        raw = taroApi.getStorageSync(key);
      } else if (typeof taroApi.getStorage === 'function') {
        try {
          const res = await taroApi.getStorage({ key });
          raw = res?.data;
        } catch (e) {
          console.error('Failed to get storage:', e);
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
      if (typeof taroApi.setStorageSync === 'function') {
        taroApi.setStorageSync(key, data);
        return;
      }
      if (typeof taroApi.setStorage === 'function') {
        await taroApi.setStorage({ key, data });
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    },
    remove: async (key: string) => {
      if (!key) return;
      if (typeof taroApi.removeStorageSync === 'function') {
        taroApi.removeStorageSync(key);
        return;
      }
      if (typeof taroApi.removeStorage === 'function') {
        await taroApi.removeStorage({ key });
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
});

export interface PersistStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export const createPersistStorage = (): PersistStorage => {
  const taroApi = Taro;
  return {
    getItem: (name: string): string | null => {
      if (typeof taroApi.getStorageSync === 'function') {
        const raw = taroApi.getStorageSync(name);
        if (raw == null) return null;
        return typeof raw === 'string' ? raw : JSON.stringify(raw);
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(name);
      }
      return null;
    },
    setItem: (name: string, value: string) => {
      if (typeof taroApi.setStorageSync === 'function') {
        taroApi.setStorageSync(name, value);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }
    },
    removeItem: (name: string) => {
      if (typeof taroApi.removeStorageSync === 'function') {
        taroApi.removeStorageSync(name);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
      }
    }
  };
};

export default useStorageStore;
