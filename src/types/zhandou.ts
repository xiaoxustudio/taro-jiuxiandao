import { ReactNode } from 'react';
import { ActorDataConfigForZhanDou } from './actor';

/**
 * @description: 妖兽战斗数据
 * @return {*}
 */
export interface YaoShouZDType
  extends Omit<ActorDataConfigForZhanDou, 'xianyuan' | 'fashu'> {
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
export interface ActorZDType
  extends Omit<ActorDataConfigForZhanDou, 'xianyuan' | 'fashu'> {
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
