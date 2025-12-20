// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      'taro',
      {
        framework: 'react',
        ts: true,
        compiler: 'vite',
        targets: {
          chrome: '49',
          ios: '10'
        }
      }
    ],
    [
      'import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false
      }
    ]
  ]
};
