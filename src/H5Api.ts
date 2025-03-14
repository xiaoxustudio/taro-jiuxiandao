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
  // 注入H5API
  Object.defineProperty(window, 'H5Api', {
    value: functions,
    configurable: false,
    enumerable: true
  });
}
