import useActorStore from './store/actor';
import useStore from './store/store';

export default {
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
