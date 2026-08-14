<div align="center">

[<img src="./docs/images/cryptopayserver.png" width="400" alt="Cryptopayserver logo">](https://cryptopayserver.online/)

# Cryptopayserver

**Open Source Crypto Payment Server**

[Website](https://cryptopayserver.online) · [Live Demo](https://cryptopayserver.online/login) · [FAQ](https://cryptopayserver.online/#faq) · [Docs](https://cryptopayserver.gitbook.io/cryptopayserver) · [Telegram](https://t.me/cryptopayserver)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](#contributing)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-Support-yellow?logo=buymeacoffee)](#)

</div>

**Cryptopayserver** is a free, open-source, self-hosted cryptocurrency payment server.  
Accept payments across multiple blockchains and assets — your keys, your data, your control. No tracking, no ads, no middleman fees.

<div align="center">
  <img src="./docs/images/default.jpg" width="600" alt="Cryptopayserver dashboard preview">
</div>

## Why Cryptopayserver?

Cryptopayserver is built for people who value sovereignty and simplicity:

- 💼 Accept crypto payments across multiple blockchains
- 🏦 Perfect for buy-and-hold strategies
- 🎯 Clear portfolio insights and transaction overview
- 👻 Privacy-first — your data never leaves your server
- 🧘 Minimalist design, focused on what matters
- 😎 Fully self-hosted with **zero telemetry**
- 👌 Open source and easily forkable

## Features

### Supported Chains

- Bitcoin (including Lightning Network)
- Ethereum
- Solana
- Binance Smart Chain
- Litecoin
- XRP
- TON
- Tron
- And more (customizable)

### Core Capabilities

**Dashboard**  
Track daily orders, transaction volumes, sales, and store status at a glance.

**Wallet Management**

- Create wallets from mnemonic phrases (import/export supported)
- Multi-chain address generation
- Balance overview, gas fee estimation, and asset transfers
- View private keys and sensitive data securely

**Store Management**  
Create stores linked to wallets and start accepting payments immediately.

**System Notifications**  
In-app alerts for version updates, transactions, order completions, and more.

**Plugins & Integrations**

- Shopify
- Point of Sale
- Pay Button
- Crowdfunding
- Support for external e-commerce platforms and small apps

**Additional Services**

- Testnet / Mainnet switching
- Exchange rate & currency pair services
- Email notifications
- Automation tools
- Blockchain scanner services

## Technology Stack

Built with modern web technologies in **TypeScript**.

| Layer    | Technologies                  |
| -------- | ----------------------------- |
| Backend  | Next.js, MySQL, Prisma, Redis |
| Frontend | React, Tailwindcss, Radix-ui  |

## Quick Start

### Try the Live Demo

No installation needed — try it first:  
**[Live Demo](https://cryptopayserver.online/login)**

### Docker (Recommended)

```bash
# Coming soon — official images will be published on Docker Hub
# docker run -d \
#   --name cryptopayserver \
#   -p 5230:5230 \
#   -v ~/.cryptopayserver:/var/opt/cryptopayserver \
#   cryptopayserver/cryptopayserver:stable
```

## Contributing

We welcome contributions of all kinds! Whether you're fixing bugs, adding features, improving documentation, or helping with translations — every contribution matters.

**Ways to contribute:**

- 🐛 [Report bugs](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=bug_report.md)
- 💡 [Suggest features](https://github.com/cryptopayserver00/cryptopayserver/issues/new?template=feature_request.md)
- 🔧 [Submit pull requests](https://github.com/cryptopayserver00/cryptopayserver/pulls)
- 📖 [Improve documentation](https://github.com/cryptopayserver00/cryptopayserver/tree/master/docs)
- 🌍 [Help with translations](https://github.com/cryptopayserver00/cryptopayserver/tree/master/public/locales)

## Sponsors

Love Cryptopayserver? [Sponsor us on GitHub](https://github.com/sponsors/cryptopayserver00) to help keep the project growing!

<!-- ## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cryptopayserver00/cryptopayserver&type=Date)](https://star-history.com/#cryptopayserver00/cryptopayserver&Date) -->

## Privacy Policy

Cryptopayserver is built with privacy as a core principle. As a self-hosted application, all your data stays on your infrastructure. There is no telemetry, no tracking, and no data collection. See our [Privacy Policy](https://cryptopayserver.online/privacy) for details.

## License

© 2025 - 2026 [Cryptopayserver](https://cryptopayserver.online)

Cryptopayserver is open-source software licensed under the [MIT License](LICENSE).
