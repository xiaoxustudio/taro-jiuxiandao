import { random } from 'lodash-es';

export type ZhanDouHitResult<D extends { fangyu: number; qixue: number }> = {
  isCrit: boolean;
  damage: number;
  defender: D;
};

/**
 * @description: 计算一次战斗命中结果（暴击、伤害、扣血）
 * @param {*} attacker
 * @param {*} defender
 * @param {*} options
 * @return {*}
 */
export function calcZhanDouHit<
  A extends { gongji: number; baoji: number },
  D extends { fangyu: number; qixue: number }
>(
  attacker: A,
  defender: D,
  options?: {
    randomInt?: (min: number, max: number) => number;
    critMul?: number;
    minDamage?: number;
  }
) {
  const randomInt = options?.randomInt ?? random;
  const isCrit = randomInt(1, 100) <= attacker.baoji;
  const critMul = options?.critMul ?? 1.5;
  const baseAtk = Math.max(
    0,
    Math.round(attacker.gongji * (isCrit ? critMul : 1))
  );
  const def = Math.max(0, defender.fangyu);
  const minDamage = options?.minDamage ?? 1;
  const damage = Math.max(minDamage, Math.round(baseAtk * (100 / (100 + def))));
  const newHp = Math.max(0, Math.round(defender.qixue - damage));
  const nextDefender = { ...defender, qixue: newHp } as D;
  return { isCrit, damage, defender: nextDefender } as ZhanDouHitResult<D>;
}
