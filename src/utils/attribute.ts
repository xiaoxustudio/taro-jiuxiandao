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

export function generateActorAttributes(ratios: {
  qixueRatio?: number;
  fangyuRatio?: number;
  wuliRatio?: number;
  gongsuRatio?: number;
  baojiRatio?: number;
  fashuRatio?: number;
}) {
  const baseAttributes = {
    qixue: 1200,
    fangyu: 0,
    wuli: 150,
    gongsu: 20,
    baoji: 0.0,
    fashu: 0
  };
  const qixue = Math.round(baseAttributes.qixue * (ratios.qixueRatio ?? 1));
  const newAttributes = {
    qixue,
    max_qixue: qixue,
    fangyu: Math.round(baseAttributes.fangyu * (ratios.fangyuRatio ?? 1)),
    wuli: Math.round(baseAttributes.wuli * (ratios.wuliRatio ?? 1)),
    gongsu: Math.round(baseAttributes.gongsu * (ratios.gongsuRatio ?? 1)),
    baoji: parseFloat(
      (baseAttributes.baoji * (ratios.baojiRatio ?? 1)).toFixed(2)
    ),
    fashu: Math.round(baseAttributes.fashu * (ratios.fashuRatio ?? 1))
  };
  return newAttributes;
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
    default:
      throw new Error(`not found attr ${attr}`);
  }
};
