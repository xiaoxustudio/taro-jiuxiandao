import { PropsWithChildren } from 'react';
import './app.less';
import H5Api from './H5Api';

H5Api(); // 初始化H5Api

function App({ children }: PropsWithChildren<any>) {
  return children;
}

export default App;
