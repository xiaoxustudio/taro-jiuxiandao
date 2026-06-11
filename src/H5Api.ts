import useActorStore from './store/actor';
import useStore from './store/store';

// 允许调用的来源域名列表（生产环境应配置实际域名）
const ALLOWED_ORIGINS = [
  'localhost',
  '127.0.0.1'
  // TODO: 添加生产环境域名
];

const isOriginAllowed = () => {
  // H5 环境外的调用视为安全
  if (typeof window === 'undefined') return true;
  // 无 referer 的直接调用视为安全（如书签访问）
  const referer = document.referrer;
  if (!referer) return true;
  try {
    const url = new URL(referer);
    return ALLOWED_ORIGINS.some(
      (origin) => url.hostname === origin || url.hostname.endsWith(`.${origin}`)
    );
  } catch {
    return false;
  }
};

const functions = {
  /**
   * @description: 清空存档（带来源验证）
   * @return {*}
   */
  clearStore: () => {
    if (!isOriginAllowed()) {
      // eslint-disable-next-line no-console
      console.warn('[H5Api] clearStore blocked: origin not allowed');
      return false;
    }
    useActorStore.setState({ actors: {} });
    useStore.setState({ current: '' });
    return true;
  }
};

export default () => {
  // 注入H5API
  Object.defineProperty(window, 'H5Api', {
    value: functions,
    configurable: false,
    enumerable: true
  });
};
