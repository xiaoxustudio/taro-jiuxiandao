import { monsterNames, monsterSurnames, nameParts, surnames } from '@/consts';
import Taro from '@tarojs/taro';
import { omit } from 'lodash-es';

/**
 * @description: 跳转路由（自动加pages）
 * @param {*} url
 * @param {Taro} options
 * @return {*}
 */
export function navigateTo(url, options?: Taro.navigateTo.Option) {
  Taro.navigateTo({
    url: `/pages/${url}`,
    ...(options ? omit(options, ['url']) : {}),
  });
}

/**
 * @description: 生成uuid
 * @return {*}
 */
export function generateUUID() {
  // 使用密码学安全的随机数生成器
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);

  // 设置版本位（第7字节的高四位为0100）
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  // 设置变体位（第9字节的高两位为10）
  buffer[8] = (buffer[8] & 0x3f) | 0x80;

  // 转换为十六进制字符串并格式化
  return Array.from(buffer)
    .map((byte, index) => {
      // 按规范在指定位置插入分隔符
      if ([4, 6, 8, 10].includes(index))
        return '-' + byte.toString(16).padStart(2, '0');
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
  const nameLength = Math.floor(Math.random() * 3) + 1; //在2到4字之间

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
    fashu: 0,
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
    fashu: Math.round(baseAttributes.fashu * (ratios.fashuRatio ?? 1)),
  };

  return newAttributes;
}

/**
 * @description: 小周天计算
 * @param {number} n
 * @param {*} limit 限制最大
 * @return {*}
 */
export function ZhouTian(n: number, limit = 12): number {
  return Math.min((Date.now() - n) / 3600000, limit);
}
