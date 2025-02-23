import type { UserConfigExport } from '@tarojs/cli';

export default {
  mini: {},
  h5: {
    devServer: {
      port: 9000, // 九仙
    },
  },
} satisfies UserConfigExport<'vite'>;
