import Taro from '@tarojs/taro';
import { omit } from 'lodash-es';

type NavigateOptions = Omit<
  (Taro.navigateTo.Option & Taro.redirectTo.Option) & {
    replace?: boolean;
    all?: boolean;
  },
  'url'
>;

export function navigateTo(url: string, options: NavigateOptions = {}) {
  const opts = omit(options, ['url']);
  if (opts && opts.all) {
    Taro.reLaunch({
      ...opts,
      url: `/pages/${url}`
    } as Taro.reLaunch.Option);
    return;
  }
  if (opts && opts.replace) {
    Taro.redirectTo({
      ...opts,
      url: `/pages/${url}`
    } as Taro.redirectTo.Option);
    return;
  }
  Taro.navigateTo({
    url: `/pages/${url}`,
    ...opts
  });
}

export function navigateBack(option?: Parameters<typeof Taro.navigateBack>[0]) {
  Taro.navigateBack(option);
}
