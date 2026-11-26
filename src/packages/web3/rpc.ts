import { BLOCKCHAINNAMES, CHAINIDS } from '@/packages/constants/blockchain'
import axios, { AxiosRequestConfig } from 'axios'

export class RPC {
  static axiosInstance = axios.create({
    timeout: 50000,
  })

  static getRpcsByChainIds(chainIds: CHAINIDS): string[] {
    const rpcs = BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.rpc
    if (!rpcs || rpcs.length === 0) {
      throw new Error('can not support the rpc of chain')
    }
    // Deduplicate while preserving order (env overrides first).
    return [...new Set(rpcs.filter((url) => Boolean(url && String(url).trim())))]
  }

  static getRpcByChainIds(chainIds: CHAINIDS): string {
    const rpcs = this.getRpcsByChainIds(chainIds)
    const randomIndex = Math.floor(Math.random() * rpcs.length)
    return rpcs[randomIndex]
  }

  static async callRPC(chainIds: CHAINIDS, method: string, params: any): Promise<any> {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1,
    })

    const urls = this.getRpcsByChainIds(chainIds)
    if (!urls.length) return null

    for (const url of urls) {
      const config: AxiosRequestConfig = {
        method: 'POST',
        maxBodyLength: Infinity,
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      }

      try {
        const response = await this.axiosInstance.request(config)

        if (response.status !== 200) {
          console.error(response.data)
          continue
        }

        if (response.data.error) {
          const code = response.data.error?.code
          // Rate limit / capacity — try next endpoint
          if (code === 429 || String(response.data.error?.message || '').includes('capacity')) {
            console.warn(`[RPC] ${url} rate-limited, trying next`)
            continue
          }
          console.error(`${JSON.stringify(response.data.error)} | ${JSON.stringify(config)}`)
          continue
        }
        return response.data
      } catch (e: any) {
        const status = e?.response?.status
        if (status === 429) {
          console.warn(`[RPC] ${url} HTTP 429, trying next`)
          continue
        }
        console.error(e)
      }
    }

    return null
  }
}
