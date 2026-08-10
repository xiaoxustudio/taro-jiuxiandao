import { useCallback, useEffect, useRef } from 'react';

export default function useBattleTimer() {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const guajiTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoBattleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCombatTimer = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const clearGuajiTimer = useCallback(() => {
    if (guajiTimer.current !== null) {
      clearInterval(guajiTimer.current);
      guajiTimer.current = null;
    }
  }, []);

  const clearAutoBattleTimer = useCallback(() => {
    if (autoBattleTimer.current !== null) {
      clearTimeout(autoBattleTimer.current);
      autoBattleTimer.current = null;
    }
  }, []);

  const setCombatTimer = useCallback(
    (fn: () => void, interval: number) => {
      clearCombatTimer();
      timer.current = setInterval(fn, interval);
    },
    [clearCombatTimer]
  );

  const setGuajiTimer = useCallback(
    (fn: () => void, interval: number) => {
      clearGuajiTimer();
      guajiTimer.current = setInterval(fn, interval);
    },
    [clearGuajiTimer]
  );

  const setAutoBattleTimer = useCallback(
    (fn: () => void, delay: number) => {
      clearAutoBattleTimer();
      autoBattleTimer.current = setTimeout(fn, delay);
    },
    [clearAutoBattleTimer]
  );

  const clearAll = useCallback(() => {
    clearCombatTimer();
    clearGuajiTimer();
    clearAutoBattleTimer();
  }, [clearCombatTimer, clearGuajiTimer, clearAutoBattleTimer]);

  useEffect(() => clearAll, [clearAll]);

  return {
    setCombatTimer,
    setGuajiTimer,
    setAutoBattleTimer,
    clearCombatTimer,
    clearGuajiTimer,
    clearAutoBattleTimer,
    clearAll
  };
}
