import { PropsWithChildren } from 'react';
import H5Api from './services/h5-api';
import './app.less';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
if (process.env.NODE_ENV === 'development') {
  H5Api(); // 仅开发环境初始化调试 API
}

function App({ children }: PropsWithChildren<any>) {
  return children;
}

export default App;
