import { ActorDataConfigForZhanDou } from '.';

export enum GongFaPinJie {
  一品 = '一品',
  二品 = '二品',
  三品 = '三品',
  四品 = '四品',
  五品 = '五品',
  六品 = '六品',
  七品 = '七品',
  八品 = '八品',
  九品 = '九品',
  十品 = '十品',
  十一品 = '十一品',
  十二品 = '十二品',
  十三品 = '十三品',
  十四品 = '十四品',
  十五品 = '十五品'
}

export interface GongFaType {
  id: string;
  name: string;
  pj: GongFaPinJie; // 品阶
  lv: string; // 层级
  exp: number; // 进度
  max_exp: number; //
  lg: string; // 灵根
  limit: string; // 限制
  xl: string; // 修炼增益
  attr: Partial<ActorDataConfigForZhanDou>; // 其他属性
  time?: number; // 开始时间
}
