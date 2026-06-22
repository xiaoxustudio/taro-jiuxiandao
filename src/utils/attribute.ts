import { REALM_ORDER } from '@/assets/const';
import type { ActorDataConfigForZhanDou } from '@/types';

export function getRealmTierIndex(
  realm?: string,
  realmOrder: readonly string[] = REALM_ORDER
) {
  if (!realm) return 0;
  const idx = realmOrder.indexOf(realm);
  return idx >= 0 ? idx : 0;
}

export type ActorDataConfigForZhanDouEx = ActorDataConfigForZhanDou & {
  shenshi: number;
  xiuwei: number;
};

export const AttrTransformChinese = (
  attr: keyof ActorDataConfigForZhanDouEx
) => {
  switch (attr) {
    case 'gongji':
      return '物理攻击';
    case 'baoji':
      return '暴击';
    case 'fangyu':
      return '防御';
    case 'fashu':
      return '法术';
    case 'qixue':
      return '气血';
    case 'sudu':
      return '速度';
    case 'shenshi':
      return '神识';
    case 'xiuwei':
      return '修为';
    case 'xianyuan':
      return '仙缘';
    default:
      throw new Error(`not found attr ${attr}`);
  }
};
