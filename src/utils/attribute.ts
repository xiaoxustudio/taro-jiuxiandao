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

export type TotalAttr = Pick<
  ActorDataConfigForZhanDou,
  'qixue' | 'gongji' | 'fangyu' | 'sudu' | 'baoji' | 'fashu'
>;

export function getTotalAttr(
  get: (key: string, defaultValue?: unknown) => unknown
): TotalAttr {
  return {
    qixue: Number(get('qixue') || 0) + Number(get('addAttr.qixue') || 0),
    gongji: Number(get('gongji') || 0) + Number(get('addAttr.gongji') || 0),
    fangyu: Number(get('fangyu') || 0) + Number(get('addAttr.fangyu') || 0),
    sudu: Number(get('sudu') || 0) + Number(get('addAttr.sudu') || 0),
    baoji: Number(get('baoji') || 0) + Number(get('addAttr.baoji') || 0),
    fashu: Number(get('fashu') || 0) + Number(get('addAttr.fashu') || 0)
  };
}

type RealmSource =
  | { jingjie?: string; jingjie1?: string; jingjie2?: string }
  | ((key: string) => unknown);

export function getRealmText(source: RealmSource): string {
  const jingjie =
    typeof source === 'function' ? source('jingjie') : source.jingjie;
  const jingjie1 =
    typeof source === 'function' ? source('jingjie1') : source.jingjie1;
  const jingjie2 =
    typeof source === 'function' ? source('jingjie2') : source.jingjie2;
  return `${jingjie || ''}${jingjie1 || ''}${jingjie2 || ''}`;
}
