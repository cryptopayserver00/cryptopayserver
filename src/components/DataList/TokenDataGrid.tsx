import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useSnackPresistStore } from '@/lib/store'
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from '@/packages/constants'
import { COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import { FormatNumberToEnglish } from '@/utils/strings'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  coin: string
  price: string
  unit: string
  marketCap: number
  marketCapStr: string
  twentyFourHVol: string
  twentyFourHChange: number
  lastUpdatedAt: number
}

type GridType = {
  source: 'dashboard' | 'none'
}

const PAGE_SIZE = 10

export default function TokenDataGrid(props: GridType) {
  const { t } = useTranslation('')
  const { source } = props
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async () => {
    try {
      const ids = Object.values(COINS).map((item) => COINGECKO_IDS[item])
      const unit = CURRENCY[0]

      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids.length > 1 ? ids.join(',') : ids[0],
          currency: unit,
        },
      })

      if (response && response.result) {
        const rows: RowType[] = Object.values(COINS)
          .filter((item) => response.data[COINGECKO_IDS[item]])
          .map((item, index: number) => {
            const data = response.data[COINGECKO_IDS[item]]

            const price = data['usd']
            const marketCap = data['usd_market_cap']
            const twentyFourHVol = data['usd_24h_vol']
            const twentyFourHChange = data['usd_24h_change']
            const lastUpdatedAt = data['last_updated_at']

            return {
              id: index + 1,
              coin: item,
              price: `${CURRENCY_SYMBOLS[unit]}${price}`,
              unit: unit,
              marketCap: marketCap,
              marketCapStr: FormatNumberToEnglish(marketCap),
              twentyFourHVol: FormatNumberToEnglish(twentyFourHVol),
              twentyFourHChange: twentyFourHChange,
              lastUpdatedAt: lastUpdatedAt,
            }
          })

        rows.sort((a, b) => b.marketCap - a.marketCap)
        setRows(rows)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(t('The network error occurred. Please try again later.'))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init()
  }, [])

  const displayRows = source === 'dashboard' ? rows.slice(0, PAGE_SIZE) : rows

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE)
  const pagedRows =
    source === 'dashboard'
      ? displayRows
      : displayRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>{t('Name')}</TableHead>
              <TableHead>{t('Price')}</TableHead>
              <TableHead>24h %</TableHead>
              <TableHead>{t('Market Cap')}</TableHead>
              <TableHead>{t('Volume') + '(24h)'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => {
                const isPositive = Number(row.twentyFourHChange) >= 0
                const iconSrc = GetImgSrcByCrypto(row.coin as COINS)

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {iconSrc && (
                          <Image
                            src={iconSrc.toString()}
                            alt={row.coin}
                            width={20}
                            height={20}
                            className="rounded-full h-5 w-5"
                          />
                        )}
                        <span className="font-semibold">{row.coin}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.price}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-semibold',
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {`${parseFloat(row.twentyFourHChange.toString()).toFixed(2)} %`}
                      </span>
                    </TableCell>
                    <TableCell>{row.marketCapStr}</TableCell>
                    <TableCell>{row.twentyFourHVol}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tokens found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {source !== 'dashboard' && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
