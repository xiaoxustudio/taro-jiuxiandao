/**
 * @description: 判断当前环境是否为移动端（基于 userAgent）
 * @return {*}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}
export default {};
