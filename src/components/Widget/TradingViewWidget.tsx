import { COINPAIR } from '@/packages/constants'
import { useEffect, useRef, memo } from 'react'

type WidgetType = {
  coinPair: (typeof COINPAIR)[keyof typeof COINPAIR]
}

const TradingViewWidget = ({ coinPair }: WidgetType) => {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!coinPair || !container.current) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${coinPair}`,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      hide_legend: true,
      allow_symbol_change: false,
      save_image: false,
      hide_volume: true,
      support_host: 'https://www.tradingview.com',
    })

    container.current.appendChild(script)

    return () => {
      if (container.current) {
        container.current.innerHTML = ''
      }
    }
  }, [coinPair])

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-[calc(100%-32px)] w-full" />
    </div>
  )
}

export default memo(TradingViewWidget)
