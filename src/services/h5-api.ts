import useActorStore from '@/store/actor';
import useStore from '@/store/store';

const ALLOWED_ORIGINS = ['localhost', '127.0.0.1'];

const isOriginAllowed = () => {
  if (typeof window === 'undefined') return true;
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
  clearStore: () => {
    if (!isOriginAllowed()) {
      console.warn('[H5Api] clearStore blocked: origin not allowed');
      return false;
    }
    useActorStore.setState((state) => ({ ...state, actors: {} }));
    useStore.setState((state) => ({ ...state, current: '' }));
    return true;
  }
};

export default () => {
  Object.defineProperty(window, 'H5Api', {
    value: functions,
    configurable: false,
    enumerable: true
  });
};
