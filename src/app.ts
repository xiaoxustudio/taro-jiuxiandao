import { PropsWithChildren } from 'react';
import H5Api from './H5Api';
import './app.less';

H5Api(); // 初始化H5Api

function App({ children }: PropsWithChildren<any>) {
  return children;
}

export default App;
