import { PropsWithChildren } from 'react';
import './app.less';
import { FBError } from './utils/fabao';

FBError.addEventListener((e) => {
  console.log(e);
});
function App({ children }: PropsWithChildren<any>) {
  return children;
}

export default App;
