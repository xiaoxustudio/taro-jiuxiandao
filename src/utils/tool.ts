/**
 * @description: 判断当前环境是否为移动端（基于 userAgent）
 * @return {*}
 */
export function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}
export default {};
