import { dfGrades } from '@/assets/const';

export interface ChengHaoRule {
  name: string;
  exp: number;
}

export const CHENGHAO_RULES: ChengHaoRule[] = [
  { name: '丹徒', exp: 0 },
  { name: '丹士', exp: 100 },
  { name: '丹师', exp: 400 },
  { name: '丹宗', exp: 1200 },
  { name: '丹王', exp: 3000 },
  { name: '丹圣', exp: 8000 }
];

export interface DanLuCostItem {
  name: string;
  num: number;
}

export interface DanLuLevelConfig {
  lv: number;
  name: string;
  maxGrade: string;
  maxGradeIdx: number;
  costLs: number;
  costItems: DanLuCostItem[];
}

export const DANLU_MAX_LV = 5;

export const DANLU_LEVELS: DanLuLevelConfig[] = [
  {
    lv: 1,
    name: '凡品丹炉',
    maxGrade: dfGrades[2],
    maxGradeIdx: 3,
    costLs: 500,
    costItems: [{ name: '升灵石', num: 1 }]
  },
  {
    lv: 2,
    name: '青玉丹炉',
    maxGrade: dfGrades[3],
    maxGradeIdx: 4,
    costLs: 2000,
    costItems: [{ name: '升灵石', num: 2 }]
  },
  {
    lv: 3,
    name: '紫金丹炉',
    maxGrade: dfGrades[4],
    maxGradeIdx: 5,
    costLs: 8000,
    costItems: [{ name: '升灵石', num: 3 }]
  },
  {
    lv: 4,
    name: '琉璃丹炉',
    maxGrade: dfGrades[5],
    maxGradeIdx: 6,
    costLs: 20000,
    costItems: [{ name: '升灵石', num: 5 }]
  },
  {
    lv: 5,
    name: '神火丹炉',
    maxGrade: dfGrades[6],
    maxGradeIdx: 7,
    costLs: 50000,
    costItems: [{ name: '升灵石', num: 8 }]
  }
];

export function getDanLuLevel(lv: number): DanLuLevelConfig | undefined {
  return DANLU_LEVELS.find((v) => v.lv === lv);
}

export function getDanLuSpeed(lv: number): number {
  return Math.max(0.3, 1 - lv * 0.1);
}
