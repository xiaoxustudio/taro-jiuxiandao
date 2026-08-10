import { useCallback } from 'react';
import type { ActorDataConfig } from '@/types';
import TimeArray from '@/utils/TimeArray';

type ActorGet = (key: string, defaultValue?: any) => any;
type ActorSet = (key: string, val: any) => void;

const getElapsedHours = (time1: number, now = Date.now()) =>
  (now - time1) / TimeArray.Map.hour;

const getDaysElapsed = (time1: number, now = Date.now()) =>
  Math.floor((now - time1) / (TimeArray.Map.hour * 24));

const advanceTime1 = (time1: number, daysElapsed: number) =>
  Math.round(time1 + daysElapsed * TimeArray.Map.hour * 24);

const calcShenshiRecover = (
  maxShenshi: number,
  currentShenshi: number,
  elapsedHours: number
) =>
  Math.round(
    Math.min(maxShenshi - currentShenshi, (maxShenshi * elapsedHours) / 6)
  );

const calcPassiveRecover = (maxShenshi: number) =>
  Math.max(1, Math.round(maxShenshi / 360));

const clampShenshi = (
  currentShenshi: number,
  recover: number,
  maxShenshi: number
) => Math.min(maxShenshi, currentShenshi + recover);

const deductShouyuan = (currentShouyuan: number, daysElapsed: number) =>
  Math.max(0, currentShouyuan - daysElapsed);

function useOfflineRecover(
  _actor: ActorDataConfig,
  get: ActorGet,
  set: ActorSet
) {
  const getOfflineGains = useCallback(
    (now = Date.now()) => {
      const lastTime = get('time1');
      const elapsedHours = getElapsedHours(lastTime, now);
      const daysElapsed = getDaysElapsed(lastTime, now);
      const maxShenshi = get('max_shenshi') || 0;
      const currentShenshi = get('shenshi') || 0;
      const shenshiRecover = calcShenshiRecover(
        maxShenshi,
        currentShenshi,
        elapsedHours
      );
      return { lastTime, elapsedHours, daysElapsed, shenshiRecover };
    },
    [get]
  );

  const applyShenshiRecover = useCallback(
    (recover: number) => {
      const maxShenshi = get('max_shenshi') || 0;
      const currentShenshi = get('shenshi') || 0;
      set('shenshi', clampShenshi(currentShenshi, recover, maxShenshi));
      set('shenshiTime', Date.now());
    },
    [get, set]
  );

  const applyDailyCost = useCallback(
    (daysElapsed: number) => {
      const time1 = get('time1') || Date.now();
      const maxShouyuan = get('max_shouyuan') || 0;
      const currentShouyuan = get('shouyuan') || 0;
      const newShouyuan = Math.min(
        deductShouyuan(currentShouyuan, daysElapsed),
        maxShouyuan
      );
      set('shouyuan', newShouyuan);
      set('time1', advanceTime1(time1, daysElapsed));
      return newShouyuan;
    },
    [get, set]
  );

  return {
    getElapsedHours,
    getDaysElapsed,
    advanceTime1,
    calcShenshiRecover,
    calcPassiveRecover,
    clampShenshi,
    deductShouyuan,
    getOfflineGains,
    applyShenshiRecover,
    applyDailyCost
  };
}

export default useOfflineRecover;
