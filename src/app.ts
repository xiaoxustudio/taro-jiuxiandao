import { PropsWithChildren } from 'react';
import './app.less';
import windowApi from './windowApi';

// 注入全局API
for (const api in windowApi) {
  Object.defineProperty(window, api, {
    value: windowApi[api],
    configurable: false,
    enumerable: true
  });
}

function App({ children }: PropsWithChildren<any>) {
  return children;
}

export default App;
