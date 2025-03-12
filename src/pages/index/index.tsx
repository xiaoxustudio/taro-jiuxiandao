import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import VConsole from 'vconsole';
import Home from '../Home';
import './index.less';

new VConsole({ theme: 'dark' });

export default function Index() {
  return (
    <ConfigProvider locale={zhCN}>
      <Home />
    </ConfigProvider>
  );
}
