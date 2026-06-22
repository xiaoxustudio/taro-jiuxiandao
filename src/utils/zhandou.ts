import { random } from 'lodash-es';
import type { MaterialPoolByGrade, SeedRegistryItem } from '@/assets/const';

export type ZhanDouHitResult<D extends { fangyu: number; qixue: number }> = {
  isCrit: boolean;
  damage: number;
  fashuBonus: number;
  defender: D;
};

export const TIER_MAP: Record<string, number> = {
  练气: 1,
  筑基: 2,
  结丹: 3,
  元婴: 4,
  化神: 5,
  返虚: 6,
  合体: 7,
  大乘: 8
};
export const JJ2_ARR = ['初期', '中期', '后期', '圆满', '大圆满'] as const;
export const STAGE_INDEX_MAP: Record<string, number> = {
  初期: 0,
  中期: 1,
  后期: 2,
  圆满: 3,
  大圆满: 4
};
export const STAGE_COEF_MAP: Record<string, number> = {
  初期: 1.0,
  中期: 1.12,
  后期: 1.25,
  圆满: 1.38,
  大圆满: 1.5
};
export const MONSTER_NAME_PARTS = {
  A: ['凶', '烈', '青', '赤', '玄', '金', '灵', '幽', '噬', '炎'],
  B: ['狼', '虎', '蛛', '蟒', '狮', '猿', '鳄', '蝎', '熊', '雕']
} as const;
export function pickWeightedIndex(
  weights: number[],
  rnd: (min: number, max: number) => number = random
) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const r = rnd(1, sum);
  let acc = 0;
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i];
    if (r <= acc) return i;
  }
  return 0;
}
export function calcRealmDifficulty(tier: number) {
  return 1 + Math.max(0, (tier - 1) * 0.12);
}
export function calcWinStreakFromHistory(
  history: Array<{ result: string }>
): number {
  let cnt = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]?.result === '胜') cnt += 1;
    else break;
  }
  return cnt;
}
export function compositeDifficultyCoef(tier: number, winStreak: number) {
  const realm = calcRealmDifficulty(tier);
  const streak = 1 + Math.min(0.25, winStreak * 0.03);
  const cap = Math.min(2.0, 1.2 + tier * 0.05);
  return Math.min(cap, realm * streak);
}
export function calcAttrScale(
  base: number,
  add: number,
  weight: number,
  cap: number
) {
  const safeBase = Math.max(1, base);
  if (safeBase <= 0) return 1;
  const ratio = Math.max(0, add / safeBase);
  return 1 + Math.min(cap, ratio * weight);
}
export function buildMonsterBaseAttributes(params: {
  tier: number;
  jj1: number;
  jj2: string;
  rnd?: (min: number, max: number) => number;
}) {
  const rnd = params.rnd ?? random;
  const j1Coef = 1 + (params.jj1 - 1) * 0.12;
  const stageCoef = STAGE_COEF_MAP[params.jj2] || 1.0;
  const geomBase = 1.8 ** (params.tier - 1);
  const scale = geomBase * j1Coef * stageCoef;
  const rawQixue = Math.round(rnd(700, 900) * scale);
  const rawGongji = Math.round(rnd(60, 110) * scale);
  const rawFangyu = Math.round(rnd(30, 80) * scale);
  const rawSudu = Math.round(
    (22 + rnd(0, 14) + params.tier) *
      (1 + (params.jj1 - 1) * 0.04) *
      (1 + (stageCoef - 1) * 0.5) *
      geomBase
  );
  const rawBaoji = Math.min(
    60,
    rnd(4, 10 + params.tier + Math.floor(params.jj1 / 3))
  );
  const rawFashu = Math.round(rnd(5, 20) * scale);
  const xw = Math.round(
    rnd(100, 220) * params.tier * (1 + (params.jj1 - 1) * 0.07) * stageCoef
  );
  return { rawQixue, rawGongji, rawFangyu, rawSudu, rawBaoji, rawFashu, xw };
}
export function pickMaterialNameByGrade(params: {
  materialPoolByGrade?: Record<string, { name: string; itype: string }[]>;
  registry: { name: string; itype: string }[];
  targetGrade: string;
  rnd?: (min: number, max: number) => number;
}) {
  const rnd = params.rnd ?? random;
  const fromMap = params.materialPoolByGrade?.[params.targetGrade] ?? [];
  let pool = fromMap;
  if (!pool.length) {
    const filtered = params.registry.filter(
      (m) => m.itype === params.targetGrade
    );
    pool = filtered.length ? filtered : params.registry;
  }
  return pool[rnd(0, Math.max(0, pool.length - 1))]?.name || '妖丹';
}

export function resolveMaterialPoolByGrade(params: {
  get: (key: string, defaultValue?: any) => any;
  set: (key: string, data: any) => void;
  storageGetSync: (key?: string) => any;
}): MaterialPoolByGrade | undefined {
  let materialPoolByGrade = params.get('materialPoolByGrade') as
    | MaterialPoolByGrade
    | undefined;
  if (!materialPoolByGrade) {
    const keys = params.get('materialPoolStorageKeysByGrade') as
      | Record<string, string>
      | undefined;
    if (keys && Object.keys(keys).length) {
      const next: Record<string, { name: string; itype: string }[]> = {};
      Object.entries(keys).forEach(([grade, key]) => {
        const loaded = params.storageGetSync(key);
        if (!Array.isArray(loaded)) return;
        if (loaded.length && typeof loaded[0] === 'string') {
          next[grade] = (loaded as any[]).map((name) => ({
            name,
            itype: grade
          }));
        } else {
          next[grade] = loaded as any;
        }
      });
      if (Object.keys(next).length) {
        materialPoolByGrade = next as MaterialPoolByGrade;
        params.set('materialPoolByGrade', next);
      }
    }
  }
  return materialPoolByGrade;
}

export function resolveDanfangPoolByGrade(params: {
  get: (key: string, defaultValue?: any) => any;
  set: (key: string, data: any) => void;
  storageGetSync: (key?: string) => any;
}) {
  let danfangPoolByGrade = params.get('danfangPoolByGrade') as
    | Record<string, any[]>
    | undefined;
  if (!danfangPoolByGrade) {
    const keys = params.get('danfangPoolStorageKeysByGrade') as
      | Record<string, string>
      | undefined;
    if (keys && Object.keys(keys).length) {
      const next: Record<string, any[]> = {};
      Object.entries(keys).forEach(([grade, key]) => {
        const loaded = params.storageGetSync(key);
        if (!Array.isArray(loaded)) return;
        next[grade] = loaded as any[];
      });
      if (Object.keys(next).length) {
        danfangPoolByGrade = next;
        params.set('danfangPoolByGrade', next);
      }
    }
  }
  return danfangPoolByGrade;
}

export function resolveSeedRegistry(params: {
  get: (key: string, defaultValue?: any) => any;
  set: (key: string, data: any) => void;
  storageGetSync: (key?: string) => any;
}) {
  let seedRegistry = params.get('seedRegistry') as
    | SeedRegistryItem[]
    | undefined;
  if (!seedRegistry || !seedRegistry.length) {
    const key = params.get('seedRegistryStorageKey') as string | undefined;
    if (key) {
      const loaded = params.storageGetSync(key);
      if (Array.isArray(loaded)) {
        seedRegistry = loaded as SeedRegistryItem[];
        params.set('seedRegistry', seedRegistry);
      }
    }
  }
  return seedRegistry;
}

/**
 * @description: 计算一次战斗命中结果（暴击、伤害、扣血）
 * @param {*} attacker
 * @param {*} defender
 * @param {*} options
 * @return {*}
 */
export function calcZhanDouHit<
  A extends { gongji: number; baoji: number; fashu?: number },
  D extends { fangyu: number; qixue: number }
>(
  attacker: A,
  defender: D,
  options?: {
    randomInt?: (min: number, max: number) => number;
    critMul?: number;
    minDamage?: number;
    fashuMul?: number;
  }
) {
  const randomInt = options?.randomInt ?? random;
  const isCrit = randomInt(1, 100) <= attacker.baoji;
  const critMul = options?.critMul ?? 1.5;
  const minDamage = options?.minDamage ?? 1;
  const fashuMul = options?.fashuMul ?? 0.3;
  const baseAtk = Math.max(
    10,
    Math.round(attacker.gongji * (isCrit ? critMul : 1))
  );
  const fashuBonus = Math.round((attacker.fashu ?? 0) * fashuMul);
  const def = Math.max(0, defender.fangyu);
  const pctDamage = Math.round(baseAtk * (100 / (100 + def)));
  const minPct = Math.max(minDamage, Math.round(baseAtk * 0.05));
  const damage = Math.max(minPct, pctDamage + fashuBonus);
  const newHp = Math.max(0, Math.round(defender.qixue - damage));
  const nextDefender = { ...defender, qixue: newHp } as D;
  return {
    isCrit,
    damage,
    fashuBonus,
    defender: nextDefender
  } as ZhanDouHitResult<D>;
}
