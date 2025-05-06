import { Box } from '@mui/material';
import { COINPAIR } from 'packages/constants';
import React, { useEffect, useRef, memo } from 'react';

type WidgetType = {
  coinPair: (typeof COINPAIR)[keyof typeof COINPAIR];
};

const TradingViewWidget = (props: WidgetType) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!props.coinPair) {
      return
    }
    
    if (container.current && !scriptLoaded.current) {
      scriptLoaded.current = true;

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `BINANCE:${props.coinPair}`,
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
      });

      container.current.appendChild(script);

      return () => {
        if (container.current) {
          const scripts = container.current.querySelectorAll('script');
          scripts.forEach((s) => s.remove());

          container.current.innerHTML = '';
          scriptLoaded.current = false;
        }
      };
    }
  }, [props.coinPair]);

  return (
    <Box className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <Box className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }} />
    </Box>
  );
};

export default memo(TradingViewWidget);
