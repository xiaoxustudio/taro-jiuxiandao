import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import Home from '../Home';
import './index.less';

export default function Index() {
  return (
    <ConfigProvider locale={zhCN}>
      <Home />
    </ConfigProvider>
  );
}
