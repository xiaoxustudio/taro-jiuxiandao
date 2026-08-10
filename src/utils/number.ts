let UniqueIndex = 0;

export const CreateUniqueIndex = () => {
  return ++UniqueIndex;
};

export function safeNumber(v: unknown, fallback = 0) {
  if (typeof v !== 'number') return fallback;
  if (!Number.isFinite(v)) return fallback;
  return v;
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
      if (temp === 0) temp = 1;
      result += temp * num;
      temp = 0;
    } else if (num >= 0) {
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
      if (i % 4 === 3 && number > 0) str = units[4] + str;
    } else {
      needZero = str.length > 0;
    }
  }
  return str.replace(/^一十/, '十').replace(/零+$/, '');
}
