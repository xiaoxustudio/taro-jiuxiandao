import { FabaoPinjie } from '@/types';

export const REALM_ORDER = [
  '练气',
  '筑基',
  '结丹',
  '元婴',
  '化神',
  '返虚',
  '合体',
  '大乘'
];
export const REALM_GRADE_WEIGHTS: Record<
  (typeof REALM_ORDER)[number],
  number[]
> = {
  练气: [12, 6, 3, 1, 0, 0, 0, 0],
  筑基: [8, 10, 6, 2, 1, 0, 0, 0],
  结丹: [4, 8, 10, 5, 2, 1, 0, 0],
  元婴: [2, 5, 8, 10, 5, 2, 1, 0],
  化神: [0, 3, 6, 9, 9, 4, 2, 1],
  返虚: [0, 1, 4, 7, 9, 7, 4, 2],
  合体: [0, 0, 2, 5, 7, 9, 8, 4],
  大乘: [0, 0, 1, 3, 6, 9, 10, 8]
};
export const PJ_BY_REALM = [
  FabaoPinjie.练气,
  FabaoPinjie.筑基,
  FabaoPinjie.结丹,
  FabaoPinjie.元婴,
  FabaoPinjie.化神,
  FabaoPinjie.返虚,
  FabaoPinjie.合体,
  FabaoPinjie.大乘
];
