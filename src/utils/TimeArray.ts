/**
 * 游戏时间数组，表示 [天, 小时, 分钟]
 */
class TimeArray {
  milliseconds: number;

  static Map = { day: 86400000, hour: 3600000, minute: 60000 };

  constructor(timeArrayOrMs: number[] | number) {
    if (Array.isArray(timeArrayOrMs)) {
      this.milliseconds = TimeArray.convertToMilliseconds(timeArrayOrMs);
    } else {
      if (timeArrayOrMs < 0) throw new Error('时间不能为负');
      this.milliseconds = timeArrayOrMs;
    }
  }

  /**
   * 将 [天, 小时, 分钟] 转换为毫秒
   */
  static convertToMilliseconds([days, hours, minutes]: number[]) {
    return (
      days * TimeArray.Map.day +
      hours * TimeArray.Map.hour +
      minutes * TimeArray.Map.minute
    );
  }

  toZhouTian(limit = 12): number {
    return (
      Math.round(
        Math.min(Math.max(0, this.milliseconds / TimeArray.Map.day), limit) *
          100
      ) / 100
    );
  }

  /**
   * 加法：支持与 TimeArray 实例或数组相加
   */
  add(time: TimeArray | number[]) {
    const msToAdd =
      time instanceof TimeArray
        ? time.milliseconds
        : new TimeArray(time).milliseconds;
    return new TimeArray(this.milliseconds + msToAdd);
  }

  /**
   * 减法：支持与 TimeArray 实例或数组相减
   */
  subtract(time: TimeArray | number[]) {
    const msToSubtract =
      time instanceof TimeArray
        ? time.milliseconds
        : new TimeArray(time).milliseconds;
    return new TimeArray(this.milliseconds - msToSubtract);
  }

  /**
   * 等于
   */
  equals(other: TimeArray) {
    return this.milliseconds === other.milliseconds;
  }

  /**
   * 小于
   */
  lessThan(other: TimeArray) {
    return this.milliseconds < other.milliseconds;
  }

  /**
   * 大于
   */
  greaterThan(other: TimeArray) {
    return this.milliseconds > other.milliseconds;
  }

  /**
   * 小于等于
   */
  lessThanOrEqual(other: TimeArray): boolean {
    return this.milliseconds <= other.milliseconds;
  }

  /**
   * 大于等于
   */
  greaterThanOrEqual(other: TimeArray): boolean {
    return this.milliseconds >= other.milliseconds;
  }

  /**
   * 是否在指定时间范围内 (闭区间)
   * @param min 最小时间
   * @param max 最大时间
   */
  isBetween(min: TimeArray, max: TimeArray): boolean {
    return this.greaterThanOrEqual(min) && this.lessThanOrEqual(max);
  }

  /**
   * 转换为易读的字符串格式
   */
  toString(): string {
    const [d, h, m] = this.getTimeArray();
    return `${d}d ${h}h ${m.toFixed(1)}m`;
  }

  /**
   * 转换为 [天, 小时, 分钟] 数组（分钟可含小数）
   */
  getTimeArray() {
    let ms = this.milliseconds;
    const days = Math.floor(ms / TimeArray.Map.day);
    ms %= TimeArray.Map.day;
    const hours = Math.floor(ms / TimeArray.Map.hour);
    ms %= TimeArray.Map.hour;
    const minutes = ms / TimeArray.Map.minute;
    return [days, hours, minutes];
  }

  /**
   * 获取对象时间加上当前时间间隔后的时间戳
   */
  getAddDateTimestamp() {
    return Date.now() + this.milliseconds;
  }

  /**
   * 获取对象时间减去当前时间间隔后的时间戳
   */
  getSubDateTimestamp() {
    return Date.now() - this.milliseconds;
  }

  /**
   * 将毫秒持续时长转换为天数
   */
  getRealDays() {
    return this.milliseconds / TimeArray.Map.day;
  }
}
export default TimeArray;
