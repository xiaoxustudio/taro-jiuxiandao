import Taro from '@tarojs/taro';
import { omit } from 'lodash-es';
import { monsterNames, monsterSurnames, nameParts, surnames } from '@/consts';
import { ActorDataConfigForZhanDou } from '@/types';

export { default as TimeArray } from './TimeArray';

let UniqueIndex = 0;

export const CreateUniqueIndex = () => {
  return ++UniqueIndex;
};

type NavigateOptions = Omit<
  (Taro.navigateTo.Option & Taro.redirectTo.Option) & {
    replace?: boolean; // 替换当前
    all?: boolean; // 替换全部
  },
  'url'
>;

export const currentTime = () => Date.now();

/**
 * @description: 跳转路由（自动加顶层pages）
 * @param {*} url
 * @param {Taro} options
 * @return {*}
 */
export function navigateTo(url: string, options: NavigateOptions = {}) {
  const opts = omit(options, ['url']);
  if (opts && opts.replace) {
    if (opts.all) {
      Taro.reLaunch({
        ...opts,
        url: `/pages/${url}`
      } as Taro.reLaunch.Option);
      return;
    }
    Taro.redirectTo({
      ...opts,
      url: `/pages/${url}`
    } as Taro.redirectTo.Option);
    return;
  }
  Taro.navigateTo({
    url: `/pages/${url}`,
    ...opts
  });
}

export function navigateBack(option?: Parameters<typeof Taro.navigateBack>[0]) {
  Taro.navigateBack(option);
}

/**
 * @description: 生成uuid
 * @return {*}
 */
export function UUID(): string {
  // 使用密码学安全的随机数生成器
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);

  // 设置版本位（第7字节的高四位为0100）
  // eslint-disable-next-line no-bitwise
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  // 设置变体位（第9字节的高两位为10）
  // eslint-disable-next-line no-bitwise
  buffer[8] = (buffer[8] & 0x3f) | 0x80;

  // 转换为十六进制字符串并格式化
  return Array.from(buffer)
    .map((byte, index) => {
      // 按规范在指定位置插入分隔符
      if ([4, 6, 8, 10].includes(index))
        return `-${byte.toString(16).padStart(2, '0')}`;
      return byte.toString(16).padStart(2, '0');
    })
    .join('')
    .replace(/-/g, '') // 临时去除分隔符
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

/**
 * @description: 随机生成妖兽的名称
 * @return {*}
 */
export function generateRandomMonsterName() {
  const surname =
    monsterSurnames[Math.floor(Math.random() * monsterSurnames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 1; // 在1到3字之间

  let name = surname; // 姓氏

  for (let i = 0; i < nameLength; i++) {
    name += monsterNames[Math.floor(Math.random() * monsterNames.length)];
  }

  return name;
}

/**
 * @description: 随机生成2-4字姓名
 * @return {*}
 */
export function generateRandomName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 1; // 在2到4字之间

  let name = surname; // 姓氏

  for (let i = 0; i < nameLength; i++) {
    name += nameParts[Math.floor(Math.random() * nameParts.length)];
  }

  return name;
}

/**
 * @description:  从数组中随机取值
 * @param {T} array
 * @return {*}
 */
export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) return array?.[0]; // 如果数组为空，返回 undefined
  const randomIndex = Math.floor(Math.random() * array.length); // 生成随机索引
  return array[randomIndex]; // 返回随机索引位置的元素
}

/**
 * @description: 自动生成枚举映射
 * @param {*} T
 * @return {*}
 */
export const AutoMapObject = <T extends object>(mapType: T) =>
  Object.values(mapType).reduce(
    (acc, key) => {
      if (typeof key === 'string') {
        acc[mapType[key]] = key;
      }
      return acc;
    },
    {} as Record<keyof typeof mapType, string>
  ) as Record<keyof typeof mapType, string>;

/**
 * @description: 生成基于增幅比的角色属性
 * @return {*}
 */
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

/**
 * @description: 小周天计算
 * @param {number} n
 * @param {*} limit 限制最大
 * @return {*}
 */
export function ZhouTian(
  n: number,
  limit = 12,
  unit: 'h' | 'm' | 's' = 'h'
): number {
  const msDiff = Date.now() - n;
  let divisor = 3600000; // 默认小时
  if (unit === 'm') divisor = 60000; // 分钟
  if (unit === 's') divisor = 1000; // 秒
  return Math.min(msDiff / divisor, limit);
}

export function chineseToNumber(chineseNum: string): number {
  const chineseNumbers: { [key: string]: number } = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
    亿: 100000000
  };

  let result = 0;
  let temp = 0;

  for (let i = 0; i < chineseNum.length; i++) {
    const char = chineseNum[i];
    const num = chineseNumbers[char];

    // eslint-disable-next-line no-continue
    if (num === undefined) continue;

    if (num >= 10) {
      // 处理单位
      if (temp === 0) temp = 1; // 处理类似"十五"的情况
      result += temp * num;
      temp = 0;
    } else if (num >= 0) {
      // 处理数字
      temp = temp * 10 + num;
    }
  }

  return result + temp;
}

export function numberToChinese(number: number): string {
  const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿'];
  const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  if (number === 0) return nums[0];

  let str = '';
  let needZero = false;

  for (let i = 0; number > 0; i++) {
    const mod = number % 10;
    number = Math.floor(number / 10);

    if (mod !== 0) {
      if (needZero) {
        str = nums[0] + str;
        needZero = false;
      }
      str = nums[mod] + units[i] + str;
      if (i % 4 === 3 && number > 0) str = units[4] + str; // 处理万位
    } else {
      needZero = str.length > 0;
    }
  }

  return str.replace(/^一十/, '十').replace(/零+$/, '');
}

/**
 * 获取当前日期的字符串格式（YYYY-MM-DD）
 * @returns {string} 当前日期的字符串
 */
export function getCurrentDate(): string {
  const now = new Date(); // 获取当前时间
  const year = now.getFullYear(); // 获取年份
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 获取月份（补零）
  const day = String(now.getDate()).padStart(2, '0'); // 获取日期（补零）

  return `${year}-${month}-${day}`; // 返回格式化后的日期
}

export type ActorDataConfigForZhanDouEx = ActorDataConfigForZhanDou & {
  shenshi: number;
  xiuwei: number;
};
/**
 * @description: 属性转换中文文字
 * @param {keyof} attr
 * @return {*}
 */
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
