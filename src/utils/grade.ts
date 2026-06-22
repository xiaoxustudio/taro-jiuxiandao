import { FabaoPinjie, GongFaPinJie } from '@/types';
import { clGrades, dfGrades, dyGrades } from '@/assets/const';

const GONGFA_GRADE_ORDER: string[] = Object.values(GongFaPinJie);
const FABAO_GRADE_ORDER: string[] = Object.values(FabaoPinjie);

export function getGradeIndex(
  grade: string,
  system: 'gongfa' | 'fabao' | 'material' | 'danfang' | 'danyao'
): number {
  switch (system) {
    case 'gongfa':
      return GONGFA_GRADE_ORDER.indexOf(grade);
    case 'fabao':
      return FABAO_GRADE_ORDER.indexOf(grade);
    case 'material':
      return clGrades.indexOf(grade as (typeof clGrades)[number]);
    case 'danfang':
      return dfGrades.indexOf(grade as (typeof dfGrades)[number]);
    case 'danyao':
      return dyGrades.indexOf(grade as (typeof dyGrades)[number]);
    default:
      return -1;
  }
}

export function compareGrades(
  a: string,
  b: string,
  system: 'gongfa' | 'fabao' | 'material' | 'danfang' | 'danyao'
): number {
  const idxA = getGradeIndex(a, system);
  const idxB = getGradeIndex(b, system);
  if (idxA === -1 && idxB === -1) return 0;
  if (idxA === -1) return -1;
  if (idxB === -1) return 1;
  return idxA - idxB;
}

export function isGradeAtLeast(
  grade: string,
  minimum: string,
  system: 'gongfa' | 'fabao' | 'material' | 'danfang' | 'danyao'
): boolean {
  return compareGrades(grade, minimum, system) >= 0;
}

const GRADE_TO_BASE_INDEX: Record<string, number> = {
  一品: 1,
  二品: 2,
  三品: 3,
  四品: 4,
  五品: 5,
  六品: 6,
  七品: 7,
  八品: 8,
  九品: 9,
  十品: 10,
  十一品: 11,
  十二品: 12,
  十三品: 13,
  十四品: 14,
  十五品: 15
};

const FABAO_TO_INDEX: Record<string, number> = {
  法器: 1,
  灵器: 2,
  法宝: 3,
  古宝: 4,
  灵宝: 5,
  后天灵宝: 6,
  先天灵宝: 7,
  通天灵宝: 8
};

export function normalizeGrade(grade: string): number {
  if (grade in GRADE_TO_BASE_INDEX) return GRADE_TO_BASE_INDEX[grade];
  if (grade in FABAO_TO_INDEX) return FABAO_TO_INDEX[grade];
  return 0;
}

export function crossSystemCompare(gradeA: string, gradeB: string): number {
  return normalizeGrade(gradeA) - normalizeGrade(gradeB);
}

export function getGradeColor(grade?: string): string {
  if (!grade) return '#888';
  const idx = normalizeGrade(grade);
  const colors = [
    '#888',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#e67e22',
    '#e74c3c',
    '#f1c40f',
    '#e91e63'
  ];
  return colors[Math.min(idx, colors.length - 1)] ?? '#888';
}
