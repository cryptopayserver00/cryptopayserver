# CryptoPayServer 部署文档

## 需要部署的服务

- CryptoPayServer 服务本身
- Node 节点服务
- Mysql 中心化对象关系数据库
- Redis 中心化缓存数据库

## 配置ENV文件

```
# Main
NODE_ENV="testnet"
NEXT_PUBLIC_ENVIRONMENT="development"

# DB
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_DATABASE=""
DB_USER=""
DB_PASSWORD=""

# Coin Price
COINGECKO_AUTH = ""

# Tron
TRON_API_KEY_MAINNET = ""
TRON_API_KEY_NILE = ""

# Ton
TON_API_KEY = ""

```