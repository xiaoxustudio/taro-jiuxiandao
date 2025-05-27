class TimeArray {
  milliseconds: number;

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
    return days * 86400000 + hours * 3600000 + minutes * 60000;
  }

  toZhouTian(limit = 12): number {
    return Math.min(Math.max(0, this.milliseconds / 3600000), limit);
  }

  /**
   * 加法：支持与 TimeArray 实例或数组相加
   */
  add(time: TimeArray | number[]) {
    const ms =
      time instanceof TimeArray
        ? this.milliseconds
        : new TimeArray(time).milliseconds;
    return new TimeArray(this.milliseconds + ms);
  }

  /**
   * 减法：支持与 TimeArray 实例或数组相减
   */
  subtract(time: TimeArray | number[]) {
    const ms =
      time instanceof TimeArray
        ? this.milliseconds
        : new TimeArray(time).milliseconds;
    return new TimeArray(this.milliseconds - ms);
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
    const days = Math.floor(ms / 86400000);
    ms %= 86400000;
    const hours = Math.floor(ms / 3600000);
    ms %= 3600000;
    const minutes = ms / 60000;
    return [days, hours, minutes];
  }

  /**
   * 获取当前时间加上此时间间隔后的时间戳
   */
  getFutureTimestamp() {
    return Date.now() + this.milliseconds;
  }
}
export default TimeArray;
