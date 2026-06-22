import { LingShouData } from '@/types/actor';

const LINGSHOU_BASE = {
  qixue: 200,
  gongji: 15,
  fangyu: 8
};

const LINGSHOU_GROWTH = {
  qixue: 80,
  gongji: 6,
  fangyu: 3
};

const LINGSHOU_EXP_CURVE = [100, 250, 500, 900, 1500, 2500, 4000, 6500, 10000];

export const LINGSHOU_BONUS_RATE = 0.5;

function expForLevel(lv: number): number {
  if (lv <= 0) return LINGSHOU_EXP_CURVE[0];
  if (lv > LINGSHOU_EXP_CURVE.length) {
    return (
      LINGSHOU_EXP_CURVE[LINGSHOU_EXP_CURVE.length - 1] +
      (lv - LINGSHOU_EXP_CURVE.length) * 5000
    );
  }
  return LINGSHOU_EXP_CURVE[lv - 1];
}

export function createDefaultLingShou(extraLv = 0): LingShouData {
  const lv = 1 + extraLv;
  return {
    name: '幼灵兽',
    lv,
    exp: 0,
    maxExp: expForLevel(lv),
    gongji: LINGSHOU_BASE.gongji + LINGSHOU_GROWTH.gongji * (lv - 1),
    fangyu: LINGSHOU_BASE.fangyu + LINGSHOU_GROWTH.fangyu * (lv - 1),
    qixue: LINGSHOU_BASE.qixue + LINGSHOU_GROWTH.qixue * (lv - 1),
    active: true
  };
}

export function addLingShouExp(ls: LingShouData, exp: number): LingShouData {
  let { lv, exp: currentExp, maxExp, gongji, fangyu, qixue } = ls;
  currentExp += exp;
  while (currentExp >= maxExp) {
    currentExp -= maxExp;
    lv += 1;
    maxExp = expForLevel(lv);
    gongji += LINGSHOU_GROWTH.gongji;
    fangyu += LINGSHOU_GROWTH.fangyu;
    qixue += LINGSHOU_GROWTH.qixue;
  }
  return { ...ls, lv, exp: currentExp, maxExp, gongji, fangyu, qixue };
}

export function getLingShouBonus(ls: LingShouData): {
  gongji: number;
  fangyu: number;
  qixue: number;
} {
  if (!ls.active) return { gongji: 0, fangyu: 0, qixue: 0 };
  return {
    gongji: Math.round(ls.gongji * LINGSHOU_BONUS_RATE),
    fangyu: Math.round(ls.fangyu * LINGSHOU_BONUS_RATE),
    qixue: Math.round(ls.qixue * LINGSHOU_BONUS_RATE)
  };
}
