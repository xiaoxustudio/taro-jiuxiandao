import { ReactNode } from 'react';
import { ActorDataConfigForZhanDou } from './actor';
import { DanfangItem } from './danfang';

/**
 * @description: 妖兽战斗数据
 * @return {*}
 */
export interface YaoShouZDType extends Omit<
  ActorDataConfigForZhanDou,
  'xianyuan'
> {
  name: string;
  df: string; // 地方
  cl: string; // 掉落材料名称
  xw: number; // 击败修为
  jingjie: string;
  jingjie1: string;
  jingjie2: string;
}
/**
 * @description: 角色战斗数据
 * @return {*}
 */
export interface ActorZDType extends Omit<
  ActorDataConfigForZhanDou,
  'xianyuan'
> {
  name: string;
}

/**
 * @description: 回合数据
 * @return {*}
 */
export interface HuiHeType {
  guaji: boolean;
  huihe: number;
  target: number; // 出手方
  end: boolean;
  can: boolean;
  logs: {
    text: ReactNode;
  }[]; // 日志
}

export interface PoolResolver {
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, data: unknown) => void;
  storageGetSync: (key?: string) => unknown;
}

export interface BuildMonsterBaseAttributesParams {
  tier: number;
  jj1: number;
  jj2: string;
  rnd?: (min: number, max: number) => number;
}

export interface MonsterRawAttributes {
  rawQixue: number;
  rawGongji: number;
  rawFangyu: number;
  rawSudu: number;
  rawBaoji: number;
  rawFashu: number;
  xw: number;
}

export interface ZhanDouHitOptions {
  randomInt?: (min: number, max: number) => number;
  critMul?: number;
  minDamage?: number;
  fashuMul?: number;
}

export interface PickMaterialNameByGradeParams {
  materialPoolByGrade?: Record<string, { name: string; itype: string }[]>;
  registry: { name: string; itype: string }[];
  targetGrade: string;
  rnd?: (min: number, max: number) => number;
  maxGradeIdx?: number;
}

export type DanfangPoolByGrade = Record<string, DanfangItem[]>;

export type ZhanDouHitResult<D extends { fangyu: number; qixue: number }> = {
  isCrit: boolean;
  damage: number;
  fashuBonus: number;
  defender: D;
};
