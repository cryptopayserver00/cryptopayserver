<div align="center">

[<img src="./docs/images/cryptopayserver.png" width="400" alt="Cryptopayserver logo">](https://cryptopayserver.online/)

# CryptoPayServer

**面向商户的自托管多链支付网关**

[官网](https://cryptopayserver.online) · [在线演示](https://cryptopayserver.online/login) · [常见问题](https://cryptopayserver.online/#faq) · [文档](https://docs.cryptopayserver.online) · [Telegram](https://t.me/cryptopayserver) · [English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](#贡献指南)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)

</div>

**CryptoPayServer** 是一款免费、开源、可自托管的加密货币支付网关。
在你自己的基础设施上运行发票、付款请求、Pull Payments、出款、报表与多链钱包——密钥归你，数据归你，没有托管抽成。

<div align="center">
  <img src="./docs/images/default.jpg" width="600" alt="CryptoPayServer dashboard preview">
</div>

## 为什么选择 CryptoPayServer？

- 一个后台覆盖 UTXO、EVM、Solana、TRON、TON、XRP 等结算
- 自托管钱包（助记词 / 私钥），密钥不离开你的环境
- 面向商户：发票、付款请求、拉取付款、出款、Webhook
- 隐私优先——无遥测、无内置第三方统计
- MIT 开源，便于二次开发，或嵌入自有店面

## 功能特性

### 支持的链与网络

| 类型 | 网络 |
| ---- | ---- |
| UTXO | Bitcoin（含闪电网络）、Litecoin、Bitcoin Cash |
| 账户 / 账本 | XRP、TON、Tron、Solana |
| EVM | Ethereum、BNB Smart Chain、Arbitrum、Arbitrum Nova、Avalanche、Polygon、Base、Optimism |

应用内可切换主网 / 测试网，后续会持续扩展更多网络。

### 支付能力

- **发票（Invoices）** — 固定汇率结账，二维码、过期与状态跟踪（界面或 API）
- **付款请求（Payment Requests）** — 可分享、可复用的收款页，支持部分结算
- **拉取付款（Pull Payments）** — 用于退款、分销、奖励等可领取出款
- **出款（Payouts）** — 从店铺钱包出款，支持出款相关配置
- **报表（Reports）** — 店铺销售与支付报表
- **Webhook** — 支付事件的签名回调通知

### 钱包

- 通过助记词或私钥生成 / 导入钱包
- 单一种子派生多链地址
- 余额、手续费估算、链上转账与闪电支付
- 钱包密码保护、备份提醒、撤销 / 轮换
- 闪电后端：LND、Core Lightning、LNBits、LNDHub、Blink、OpenNode

### 店铺与账户

- 多店铺管理，并与钱包关联
- 结账、支付、邮件、通知、API Key 等设置
- 角色与权限，便于团队协作
- 账户安全：会话 Cookie、可选 **2FA（TOTP）**、SMTP 密码重置
- 店铺 **API Key**（请求头 `X-API-Key`）用于程序化创建发票

### 插件

- Shopify
- 收银台（Point of Sale）
- 支付按钮（Pay Button）
- 众筹（Crowdfunding）

### 运维

- 后台 **定时 Worker**：区块扫描，以及发票 / 付款请求 / 拉取付款过期处理
- 健康检查：`GET /api/health`
- 可选配置 CoinGecko、Tron、TON API Key，用于行情与链上数据
- 多语言：`public/locales`（en、zh、ja、ko、es、fr、pt、ru、hi 等）

## 架构概览

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────┐
│  Next.js 应用   │────▶│  MySQL (Prisma)  │     │  Blockscan │
│  （API + 界面） │     └──────────────────┘     │  / RPC     │
└────────▲────────┘                               └────────────┘
         │ cron + x-cron-secret
┌────────┴────────┐
│ schedule-worker │
└─────────────────┘
```

- **应用**：Next.js（React + API Routes）、Prisma、MySQL 8
- **Worker**：`scripts/schedule-worker.mjs` 调用受保护的 `/api/schedule/*` 任务
- **鉴权**：HTTP-only 会话 Cookie；部分发票接口支持 API Key；敏感路由带有 CSRF 与限流

## 环境要求

- **Node.js** 20+（18+ 可能可用；CI 使用 20）
- **Yarn** 1.x
- **MySQL** 8.0+
- **Docker** + Docker Compose（生产环境推荐）

## 快速开始

### 在线演示

无需安装，先体验：**[在线演示](https://cryptopayserver.online/login)**

### 本地开发

```bash
git clone https://github.com/cryptopayserver00/cryptopayserver.git
cd cryptopayserver

cp .env.example .env
# 填写 SESSION_SECRET、ENCRYPTION_KEY、CRON_SECRET、DATABASE_URL、APP_BASE_URL 等
# 生成密钥：openssl rand -base64 48

yarn install
yarn db:generate
yarn db:migrate

# 仅启动 Web（端口 8888）
yarn dev

# Web + 定时 Worker
yarn dev:all
```

浏览器打开 [http://127.0.0.1:8888](http://127.0.0.1:8888)。

常用命令：

| 命令 | 说明 |
| ---- | ---- |
| `yarn dev` / `yarn start` | 开发 / 生产 Web 服务（端口 8888） |
| `yarn worker` | 单独运行定时 Worker |
| `yarn dev:all` / `yarn start:all` | Web + Worker 一起跑 |
| `yarn db:generate` | 生成 Prisma Client |
| `yarn db:migrate` | 执行迁移（`prisma migrate deploy`） |
| `yarn test` | 单元测试（Vitest） |
| `yarn lint` / `yarn typecheck` | ESLint / TypeScript 检查 |

### Docker（推荐）

`docker-compose.yml` 会启动 **app**、**worker** 与 **MySQL**。Compose 使用名为 `shared-network` 的外部 Docker 网络。

```bash
git clone https://github.com/cryptopayserver00/cryptopayserver.git
cd cryptopayserver

cp .env.example .env.production
# 配置 MYSQL_ROOT_PASSWORD、DB_*、SESSION_SECRET、ENCRYPTION_KEY、CRON_SECRET、APP_BASE_URL 等

docker network create shared-network   # 只需执行一次

docker compose up -d
docker compose --profile migrate run --rm migrate
```

宿主机端口 **8888** 映射到容器 `3000`，健康检查走 `/api/health`。

若要从源码构建而非使用已发布镜像，可在 `docker-compose.yml` 中取消注释 `build:`，并注释掉 `image:`。

## 配置说明

将 [`.env.example`](./.env.example) 复制为 `.env`（本地）或 `.env.production`（Docker）。重要变量：

| 变量 | 作用 |
| ---- | ---- |
| `SESSION_SECRET` | 会话 / JWT 签名（建议 ≥ 32 字符） |
| `ENCRYPTION_KEY` | 加密库内敏感字段 |
| `CRON_SECRET` | 校验定时 Worker（≥ 16 字符） |
| `DATABASE_URL` | Prisma MySQL 连接串 |
| `APP_BASE_URL` | 对外访问根地址（密码重置邮件等；不从 `Host` 推断） |
| `DISABLE_PUBLIC_REGISTRATION` | 设为 `true` 关闭公开注册 |
| `NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION` | 可选 UI 镜像：关闭注册入口链接 |
| `CORS_ORIGIN` | 可选，逗号分隔的跨域白名单 |
| `TRUST_PROXY` | 仅在可信反向代理后设为 `true` |
| `REDIS_URL` | 可选 Redis，用于多实例限流（空则用内存）。若已设置但不可达，`/api/health` 仍为 200（`status: degraded`）。Compose：`docker compose --profile redis up` |
| `FORCE_SECURE_COOKIES` | 非 production 也强制 Secure Cookie（`APP_BASE_URL` 为 https 时也会自动开启） |
| `USE_HOST_PREFIX_COOKIES` | 可选 `__Host-` 会话 Cookie 名（仅 HTTPS apex；开启后需重新登录） |
| `ALLOW_LEGACY_PLAINTEXT_API_KEYS` | 仅非生产迁移：临时接受明文 API Key 并自动改哈希（production 下忽略） |
| `ENABLE_SCHEDULE_WORKER` / `SCHEDULE_BASE_URL` | Worker 开关与任务基址 |
| `SMTP_*` | 可选系统 SMTP（密码重置） |
| `BLOCKSCAN_BASE_URL` | 区块链扫描 / 水龙头 API |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect（Reown）项目 ID |
| `COINGECKO_AUTH` / `TRON_API_KEY_*` / `TON_API_KEY` | 可选第三方 API |

切勿提交真实的 `.env` / `.env.production`（已在 `.gitignore` 中忽略），以 `.env.example` 作为模板即可。

## 安全说明

- 项目目前为 **beta（v0.x）**，详见 [SECURITY.md](./SECURITY.md)
- 安全问题请私信 **viper.aur123@gmail.com**（请勿公开提 Issue）
- 生产环境建议在反向代理（Caddy / nginx）上启用 TLS 与限流
- 上线前务必设置高强度的 `SESSION_SECRET`、`ENCRYPTION_KEY`、`CRON_SECRET`
- 创建首个管理员后，建议关闭公开注册
- 升级后可先 `yarn secrets:reencrypt`（演练），再 `yarn secrets:reencrypt:apply`，批量加密存量明文密钥并哈希旧 API Key
- 上线前跑 `yarn secrets:audit-api-keys`，确认库内无明文 API Key
- 上线前跑 `yarn validate:env`（再用 `NODE_ENV=production` 跑一次），详见 [SECURITY.md](./SECURITY.md)

## 贡献指南

欢迎各种形式的贡献：修 bug、加功能、写文档、做翻译。

- [报告问题](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=bug_report.md)
- [功能建议](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=feature_request.md)
- [提交 PR](https://github.com/cryptopayserver00/cryptopayserver/pulls)
- [协助翻译](./public/locales)

CI 会在 `main` / `master` 与 PR 上执行：安装依赖 → Prisma generate → typecheck → lint → 测试 → build。

## 赞助

喜欢 CryptoPayServer？欢迎 [在 GitHub 上赞助](https://github.com/sponsors/cryptopayserver00)，帮助项目持续成长。

## 隐私政策

CryptoPayServer 是自托管软件，数据保存在你自己的基础设施上，无遥测、无内置追踪。详情见 [隐私政策](https://cryptopayserver.online/privacy)。

## 许可证

© 2025–2026 [CryptoPayServer](https://cryptopayserver.online)

基于 [MIT 许可证](./LICENSE) 开源。
