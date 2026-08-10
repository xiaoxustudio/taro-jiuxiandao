export const FANGSHI_CONFIG = {
  fbBaseCount: 10,
  dyBaseCount: 10,
  clBaseCount: 10,
  dfBaseCount: 10,
  dyPriceScale: 0.4,
  dfPriceScale: 0.08,
  randDyCount: 10,
  randClCount: 10,
  randDfCount: 10,
  negChanceMain: 0.2,
  negChanceExtra: 0.3,
  baojiNegChance: 0.15,
  negScaleMin: 0.35,
  negScaleMax: 0.6,
  fbTierCounts: {
    法器: 3,
    灵器: 3,
    法宝: 2,
    古宝: 2,
    灵宝: 2,
    后天灵宝: 1,
    先天灵宝: 1,
    通天灵宝: 1
  } as Record<string, number>
};

export const FANGSHI_REFRESH_INTERVAL = 10 * 60 * 1000;
export const XIUXIAN_TIME_SCALE_DEFAULT = 1;
