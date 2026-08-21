<div align="center">

[<img src="./docs/images/cryptopayserver.png" width="400" alt="Cryptopayserver logo">](https://cryptopayserver.online/)

# Cryptopayserver

**开源加密货币支付服务器**

[官网](https://cryptopayserver.online) · [在线演示](https://cryptopayserver.online/login) · [常见问题](https://cryptopayserver.online/#faq) · [文档](https://docs.cryptopayserver.online) · [Telegram](https://t.me/cryptopayserver)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](#贡献指南)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-Support-yellow?logo=buymeacoffee)](#)

</div>

**Cryptopayserver** 是一款免费、开源、可自托管的加密货币支付服务器。
支持跨多条区块链和多种资产接收付款——密钥由你掌控，数据由你保管。没有追踪、没有广告、没有中间商抽成。

<div align="center">
  <img src="./docs/images/default.jpg" width="600" alt="Cryptopayserver dashboard preview">
</div>

## 为什么选择 Cryptopayserver？

Cryptopayserver 专为重视自主权与简洁性的人打造：

- 💼 支持跨多条区块链接收加密货币付款
- 🏦 非常适合长期持有（buy-and-hold）策略
- 🎯 清晰的资产组合洞察与交易概览
- 👻 隐私优先——你的数据永远不会离开你的服务器
- 🧘 极简设计，专注核心功能
- 😎 完全自托管，**零遥测**
- 👌 开源，易于二次开发

## 功能特性

### 支持的链

- 比特币（含闪电网络）
- 以太坊
- Solana
- 币安智能链（BSC）
- 莱特币
- XRP
- TON
- Tron
- 更多链持续支持中（可自定义扩展）

### 核心能力

**仪表盘**
一目了然地查看每日订单数、交易量、销售额和店铺状态。

**钱包管理**

- 通过助记词创建钱包（支持导入/导出）
- 多链地址生成
- 余额概览、Gas 费估算与资产转账
- 安全查看私钥等敏感数据

**店铺管理**
创建与钱包关联的店铺，立即开始接收付款。

**系统通知**
版本更新、交易到账、订单完成等事件的应用内提醒。

**插件与集成**

- Shopify
- 收银台（POS）
- 支付按钮
- 众筹
- 支持接入外部电商平台与小型应用

**其他服务**

- 测试网 / 主网切换
- 汇率与货币对服务
- 邮件通知
- 自动化工具
- 区块链扫描服务

## 技术栈

基于现代 Web 技术、使用 **TypeScript** 构建。

| 层级 | 技术                           |
| ---- | ------------------------------ |
| 后端 | Next.js、MySQL、Prisma、Redis  |
| 前端 | React、Tailwindcss、Radix-ui   |

## 快速开始

### 体验在线演示

无需安装，先体验一下：
**[在线演示](https://cryptopayserver.online/login)**

### Docker（推荐）

```bash
# 即将推出 —— 官方镜像将发布到 Docker Hub
# docker run -d \
#   --name cryptopayserver \
#   -p 5230:5230 \
#   -v ~/.cryptopayserver:/var/opt/cryptopayserver \
#   cryptopayserver/cryptopayserver:stable
```

## 贡献指南

我们欢迎各种形式的贡献！无论是修复 bug、添加新功能、完善文档，还是帮助翻译——每一份贡献都很重要。

**参与方式：**

- 🐛 [报告问题](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=bug_report.md)
- 💡 [提出功能建议](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=feature_request.md)
- 🔧 [提交 Pull Request](https://github.com/cryptopayserver00/cryptopayserver/pulls)
- 📖 [完善文档](https://github.com/cryptopayserver00/cryptopayserver/tree/master/docs)
- 🌍 [协助翻译](https://github.com/cryptopayserver00/cryptopayserver/tree/master/public/locales)

## 赞助商

喜欢 Cryptopayserver？欢迎 [在 GitHub 上赞助我们](https://github.com/sponsors/cryptopayserver00)，帮助项目持续成长！

<!-- ## Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=cryptopayserver00/cryptopayserver&type=Date)](https://star-history.com/#cryptopayserver00/cryptopayserver&Date) -->

## 隐私政策

Cryptopayserver 将隐私作为核心设计原则。作为一款自托管应用，你的所有数据都保存在你自己的基础设施上。没有遥测、没有追踪、没有数据收集。详情请参阅我们的 [隐私政策](https://cryptopayserver.online/privacy)。

## 许可证

© 2025 - 2026 [Cryptopayserver](https://cryptopayserver.online)

Cryptopayserver 是基于 [MIT 许可证](LICENSE) 开源的软件。