import { BLOCKSCAN } from './block_scan'

/**
 * 统一经 node `/api/cryptoPrice` 取价（CoinGecko 由 node 定时拉取并缓存）。
 * 返回形态与 CoinGecko simple/price 一致：`{ [id]: { [currency]: number, ... } }`。
 */
export class CRYPTOPRICE {
  static async getCryptoPriceByCoinGecko(ids: string, currency: string): Promise<any> {
    if (!BLOCKSCAN.isConfigured) {
      throw new Error('BLOCKSCAN_BASE_URL is not configured')
    }
    if (!BLOCKSCAN.apiToken) {
      throw new Error('BLOCKSCAN_API_TOKEN is not configured')
    }

    const vs = String(currency || 'usd').toLowerCase()
    const idList = String(ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    // CoinGecko / node 对重复 id 不敏感，但去重可缩小 query
    const uniqueIds = Array.from(new Set(idList)).join(',')

    try {
      const url = `${BLOCKSCAN.baseUrl}/cryptoPrice`
      const response = await BLOCKSCAN.axiosInstance.get(url, {
        params: {
          ids: uniqueIds,
          currency: vs,
          format: 'gecko',
        },
        // 避免本机 http_proxy 把 127.0.0.1 打到代理导致 502
        proxy: false,
      })

      if (response?.data?.code === 10200 && response.data.data) {
        return response.data.data
      }

      const message = response?.data?.message || 'can not get the crypto price from node'
      throw new Error(message)
    } catch (e) {
      console.error(e)
      throw new Error('can not get the crypto price')
    }
  }
}
