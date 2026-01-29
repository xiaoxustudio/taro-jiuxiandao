<div align="center">
  <img src="src/assets/logo.png" />
</div>
<p />
<p align="center">
  <img src="https://img.shields.io/badge/License-MPL_2.0-blue.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Taro-4.x-0a7cff.svg?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18-61dafb.svg?style=for-the-badge" />
</p>

> [!WARNING]
> 此项目仍在开发阶段，欢迎提交 Issue 与 PR

# 九仙道

基于 Taro + React 的文字修仙题材重构版，覆盖多端构建能力，当前以 H5 开发体验为主。

<p align="center">
  <img width="423" height="751" alt="image" src="https://github.com/user-attachments/assets/ccb7e915-d796-4e63-a1d9-3ee78f8b6723" />
  <img width="423" height="751" alt="image" src="https://github.com/user-attachments/assets/b4b3cf93-ae8c-4e8b-aaa2-125ccc763f72" />
</p>

## 技术栈

- Taro 4.x + React 18
- TypeScript
- antd-mobile
- Zustand
- Less

## 开发与构建

1. 安装依赖

```sh
pnpm i
```

2. 启动 H5 开发

```sh
pnpm dev
```

3. 构建 H5

```sh
pnpm build
```

## 多端脚本

- H5：`pnpm dev:h5` / `pnpm build:h5`
- 小程序：`pnpm dev:weapp` / `pnpm build:weapp`
- 百度：`pnpm dev:swan` / `pnpm build:swan`
- 支付宝：`pnpm dev:alipay` / `pnpm build:alipay`
- 抖音：`pnpm dev:tt` / `pnpm build:tt`
- QQ：`pnpm dev:qq` / `pnpm build:qq`
- 京东：`pnpm dev:jd` / `pnpm build:jd`
- RN：`pnpm dev:rn` / `pnpm build:rn`
- Harmony Hybrid：`pnpm dev:harmony-hybrid` / `pnpm build:harmony-hybrid`

## 已包含页面

- 入口与角色：创建角色、角色列表
- 角色系统：角色信息、签到
- 资源系统：储物
- 战斗与玩法：试炼、炼丹、功法、法宝、坊市、洞府

## 目录结构

- src/pages：页面与路由
- src/components：基础组件库
- src/hooks：通用 hooks
- src/store：全局状态
- src/utils：业务与工具函数
- src/types：类型定义
- src/assets：静态资源与配置

## 相关项目

- 安卓端项目工程：https://github.com/xiaoxustudio/taro-jiuxiandao-android

## 历史

九仙道始于 2016 年（可能更早），22 年停止更新，本项目为重构版。

## 贡献

参照 [CONTRIBUTING](./CONTRIBUTING.md) 进行。

## 关于

此项目由徐然（原团队成员小徐）进行重构。

- 作者：https://github.com/xiaoxustudio
- 联系方式：xugame@qq.com
- QQ 群：562435313 / 467303733

## License

[MPL 2.0](LICENSE)
