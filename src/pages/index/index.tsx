import { useLoad } from "@tarojs/taro";
import { ConfigProvider } from "antd-mobile";
import zhCN from "antd-mobile/es/locales/zh-CN";
import Home from "../Home";
import "./index.less";

export default function Index() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return (
    <ConfigProvider locale={zhCN}>
      <Home />
    </ConfigProvider>
  );
}
