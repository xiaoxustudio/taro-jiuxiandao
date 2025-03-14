import useActorStore from './store/actor';
import useStore from './store/store';

const functions = {
  /**
   * @description: 清空存档
   * @return {*}
   */
  clearStore: () => {
    useActorStore.setState({ actors: {} });
    useStore.setState({ current: '' });
    return true;
  }
};

export default function () {
  Object.defineProperty(window, 'H5Api', {
    value: {},
    configurable: false,
    enumerable: true
  });
  // 注入H5API
  for (const api in functions) {
    Object.defineProperty(window, api, {
      value: window.H5Api[api],
      configurable: false,
      enumerable: true
    });
  }
}
