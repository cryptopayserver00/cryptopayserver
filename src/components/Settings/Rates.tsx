import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { PRICE_RESOURCE } from '@/packages/constants'
import { useSnackPresistStore, useStorePresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

export const Rates = () => {
  const [priceSource, setPriceSource] = useState<string>(PRICE_RESOURCE[0])

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (storeId: number) => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: {
          id: storeId,
        },
      })

      if (response.result) {
        setPriceSource(response.data.priceSource)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(storeId)
  }, [storeId])

  const onClickSave = async () => {
    try {
      if (!PRICE_RESOURCE.includes(priceSource)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect price source')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.put(Http.update_store_by_id, {
        id: storeId,
        price_source: priceSource ? priceSource : '',
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Save successful!')
        setSnackOpen(true)

        await init(storeId)
      } else {
        setSnackSeverity('error')
        setSnackMessage('The update failed, please try again later.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Rates</h3>

        <div className="space-y-2">
          <Label>Preferred Price Source</Label>
          <Select value={priceSource} onValueChange={(val) => setPriceSource(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select price source" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RESOURCE &&
                PRICE_RESOURCE.length > 0 &&
                PRICE_RESOURCE.map((item, index) => (
                  <SelectItem value={item} key={index}>
                    {item}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground pt-1">
            Current Rates source is {priceSource}.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button
          size="lg"
          onClick={onClickSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default Rates
