import { random } from 'lodash-es';
import danfangData from '@/assets/danfang.json';
import type { DanfangItem } from '@/types/danfang';
import { CWType } from '@/types';
import {
  faBaoTierConfig,
  faBaoTypeConfig,
  faBaoLocationPool,
  mainAttrMultiplier,
  extraAttrMultiplier,
  FANGSHI_CONFIG,
  danfangIds,
  dyGrades,
  dyNameParts,
  dyGradeMultipliers,
  dyRarityLevels,
  dyRarityMultipliers,
  DY_EFFECT_SCALE
} from '@/assets/const';

export type FangshiCategoryKey = 'fb' | 'dy' | 'cl' | 'df';

export type FangshiItem = {
  name: string;
  type: CWType | number;
  isPile?: boolean;
  desc?: string;
  itype?: string;
  material?: string;
  ls: number;
  baseLs?: number;
  attr?: Record<string, number>;
  lv?: number;
  pj?: string;
  id?: string;
  cl?: [string, number][];
  time?: number[];
};

export type FangshiSnapshot = {
  updatedAt: number;
  realm: string;
  items: Record<FangshiCategoryKey, FangshiItem[]>;
};

type FaBaoBaseItem = Omit<FangshiItem, 'type' | 'lv' | 'isPile'>;

const pick = <T>(list: T[]) => list[random(0, list.length - 1)];
const buildName = (parts: string[][]) => parts.map(pick).join('');
export function shuffle<T>(list: T[]) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const createFaBaoBaseList = (): FaBaoBaseItem[] => {
  const list: FaBaoBaseItem[] = [];
  const usedNames = new Set<string>();
  const tierCounts = FANGSHI_CONFIG.fbTierCounts;
  faBaoTierConfig.forEach((tier) => {
    faBaoTypeConfig.forEach((type) => {
      const count = tierCounts[tier.pj] ?? 1;
      for (let i = 0; i < count; i += 1) {
        let name = buildName(type.parts);
        let guard = 0;
        while (usedNames.has(name) && guard < 5) {
          name = buildName(type.parts);
          guard += 1;
        }
        if (usedNames.has(name)) {
          name = `${name}${random(1, 99)}`;
        }
        usedNames.add(name);
        const mainBase = random(tier.attrRange[0], tier.attrRange[1]);
        const mainValue = Math.round(
          mainBase * (mainAttrMultiplier[type.mainAttr] ?? 1)
        );
        const negMain =
          Math.random() < FANGSHI_CONFIG.negChanceMain
            ? -Math.max(
                1,
                Math.round(
                  mainValue *
                    (FANGSHI_CONFIG.negScaleMin +
                      Math.random() *
                        (FANGSHI_CONFIG.negScaleMax -
                          FANGSHI_CONFIG.negScaleMin))
                )
              )
            : mainValue;
        const attrs: Record<string, number> = { [type.mainAttr]: negMain };
        if (type.extraAttrs.length) {
          const extraKey = pick(type.extraAttrs);
          if (extraKey === 'baoji') {
            const maxB = Math.max(2, Math.round(tier.extraRange[1] / 20)) || 2;
            const bVal = random(1, maxB);
            attrs.baoji =
              Math.random() < FANGSHI_CONFIG.baojiNegChance
                ? -random(1, Math.max(1, Math.floor(maxB / 2)))
                : bVal;
          } else {
            const extraBase = random(tier.extraRange[0], tier.extraRange[1]);
            const exVal = Math.round(
              extraBase * (extraAttrMultiplier[extraKey] ?? 1)
            );
            const negExtra =
              Math.random() < FANGSHI_CONFIG.negChanceExtra
                ? -Math.max(
                    1,
                    Math.round(
                      exVal *
                        (FANGSHI_CONFIG.negScaleMin +
                          Math.random() *
                            (FANGSHI_CONFIG.negScaleMax -
                              FANGSHI_CONFIG.negScaleMin))
                    )
                  )
                : exVal;
            attrs[extraKey] = negExtra;
          }
        }
        list.push({
          name,
          attr: attrs,
          pj: tier.pj,
          itype: type.itype,
          desc: `${pick(faBaoLocationPool)}·${buildName(tier.descParts)}炼制`,
          ls: random(tier.lsRange[0], tier.lsRange[1])
        });
      }
    });
  });
  return list;
};

export const createFaBaoList = (): FangshiItem[] =>
  createFaBaoBaseList().map((item) => ({
    ...item,
    type: CWType.FB,
    lv: 0,
    isPile: false
  }));

/**
 * @description: 基于丹方配置生成固定丹药列表
 * @return {*}
 */
export const createDanYaoList = (): FangshiItem[] =>
  danfangIds.map((id) => {
    const base = danfangData[id] as unknown as DanfangItem;
    const { cl } = base;
    const { time } = base;
    return {
      ...base,
      cl,
      time,
      type: CWType.DY,
      ls: Math.round(base.ls * 1.5)
    };
  });

const pickRarity = (p: number) => {
  if (p < 0.5) return dyRarityLevels[0];
  if (p < 0.75) return dyRarityLevels[1];
  if (p < 0.9) return dyRarityLevels[2];
  if (p < 0.97) return dyRarityLevels[3];
  return dyRarityLevels[4];
};

export const createRandomDanYaoList = (
  count: number,
  realmIndex: number
): FangshiItem[] => {
  const list: FangshiItem[] = [];
  const used = new Set<string>();
  const maxGradeIndex = Math.min(dyGrades.length - 1, realmIndex);
  const allowedGrades = dyGrades.slice(0, maxGradeIndex + 1);
  for (let i = 0; i < count; i += 1) {
    let name = buildName(dyNameParts as unknown as string[][]);
    let guard = 0;
    while (used.has(name) && guard < 5) {
      name = buildName(dyNameParts as unknown as string[][]);
      guard += 1;
    }
    if (used.has(name)) {
      name = `${name}${random(1, 99)}`;
    }
    used.add(name);
    const grade = allowedGrades[random(0, allowedGrades.length - 1)];
    const isShen = Math.random() < 0.5;
    const scale = DY_EFFECT_SCALE[grade];
    const valRange = isShen ? scale.shenshi : scale.xiuwei;
    const baseVal = random(valRange[0], valRange[1]);
    const attr: Record<string, number> = isShen
      ? { shenshi: baseVal }
      : { xiuwei: baseVal };
    const priceRange = scale.price;
    const t =
      valRange[1] === valRange[0]
        ? 0
        : (baseVal - valRange[0]) / (valRange[1] - valRange[0]);
    const priceBase = Math.round(
      priceRange[0] + t * (priceRange[1] - priceRange[0])
    );
    const rarity = pickRarity(Math.random());
    const gradeMul = dyGradeMultipliers[grade];
    const rarityMul = dyRarityMultipliers[rarity];
    list.push({
      name,
      type: CWType.DY,
      isPile: true,
      itype: grade,
      desc: isShen ? '恢复神识的丹药' : '增加修为的丹药',
      attr,
      ls: Math.round(priceBase * gradeMul * rarityMul * 0.2)
    });
  }
  return list;
};
