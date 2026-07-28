import { useState, useEffect, useRef } from 'react'
import { usePickList } from '../../context/pick-list-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { useNavigate } from 'react-router'
import { SalesOrderItem } from '@/types'

export default function ProcessPicking() {
  const [step, setStep] = useState(0)
  const [pickedValues, setPickedValues] = useState<{
    [orderId: string]: number | undefined
  }>({})
  const [errors, setErrors] = useState<{ [orderId: string]: string }>({})
  const [startTime, setStartTime] = useState<string | null>(null)
  const startTimeSet = useRef(false)
  const { currentProcessPickList, updatePickedItems, isLoading } = usePickList()
  const navigate = useNavigate()

  // Summarize demand per item
  const summarizedItems =
    currentProcessPickList
      ?.reduce(
        (
          acc: {
            order_id: string
            item_code: string
            item_name: string
            unit: string
            demand: number
            rack_no: string
            open_qty: number
            order: SalesOrderItem
          }[],
          item
        ) => {
          const rackNo = item.order?.item?.RackNo || item.rack_no
          const existing = acc.find((x) => x.order_id === item.order_id)
          if (existing) {
            existing.demand += Number(item.demand) || 0
          } else {
            acc.push({
              order_id: item.order_id,
              item_code: item.item_code,
              item_name: item.item_name,
              unit: item.unit,
              demand: Number(item.demand) || 0,
              rack_no: rackNo,
              open_qty: Number(item.open_qty) || 0,
              order: item.order,
            })
          }
          return acc
        },
        []
      )
      ?.filter((item) => item.open_qty > 0) || []

  useEffect(() => {
    console.log('Summarized items:', summarizedItems)
    console.log('Picked values:', pickedValues)

    console.log(startTime)
  }, [pickedValues, startTime])

  // Get start time
  useEffect(() => {
    if (!startTimeSet.current && Object.keys(pickedValues).length > 0) {
      const now = new Date().toISOString()
      setStartTime(now)
      startTimeSet.current = true
    }
  }, [pickedValues])

  // Default picked values
  useEffect(() => {
    if (Object.keys(pickedValues).length === 0 && summarizedItems.length > 0) {
      const defaults: { [orderId: string]: number } = {}
      summarizedItems.forEach((item) => {
        defaults[item.order_id] = item.open_qty
      })
      setPickedValues(defaults)
    }
  }, [summarizedItems, pickedValues])

  const currentItem =
    step >= 0 && step < summarizedItems.length ? summarizedItems[step] : null

  const nextStep = () =>
    setStep((prev) => Math.min(prev + 1, summarizedItems.length))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  const handleConfirm = async () => {
    const payload = Object.entries(pickedValues)
      .filter(([_, value]) => value !== undefined)
      .map(([orderId, value]) => ({
        order_id: orderId,
        picked: value,
      }))

    await updatePickedItems(payload, startTime).then(() => {
      navigate(-1)
    })
  }
  const handlePickedChange = (orderId: string, value: number | undefined) => {
    setPickedValues((prev) => ({
      ...prev,
      [orderId]: value,
    }))
  }

  return (
    <div className='flex max-h-[60vh] flex-col text-xs'>
      <div className='flex-1 overflow-auto scroll-smooth bg-background'>
        {currentItem && step < summarizedItems.length && (
          <Card
            key={currentItem.order_id}
            className='max-w-sm rounded-sm border shadow'
          >
            <CardHeader className='p-2'>
              <CardTitle className='text-lg'>
                Rack: {currentItem.rack_no}
              </CardTitle>
              <p className='text-xs text-gray-500'>
                Step {step + 1} of {summarizedItems.length}
              </p>
            </CardHeader>
            <CardContent className='space-y-2 p-2'>
              <div className='font-semibold'>{currentItem.item_name}</div>
              <div className='font-bold text-gray-500'>
                Sales Order: #{currentItem.order.DocNum}
              </div>
              <div className='text-sm text-gray-500'>
                Code: {currentItem.item_code}
              </div>
              <div className='text-sm text-gray-500'>
                Unit: {currentItem.unit}
              </div>
              <div className='text-sm text-gray-500'>
                Quantity: {currentItem.demand}
              </div>
              <div className='text-sm text-gray-500'>
                Open Qty: {currentItem.open_qty}
              </div>
              <div>
                <label className='text-sm text-gray-600'>Picked</label>
                <Input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={
                    pickedValues[currentItem.order_id] !== undefined
                      ? pickedValues[currentItem.order_id]
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value

                    if (/^\d*$/.test(val)) {
                      const num = val === '' ? undefined : Number(val)

                      if (num !== undefined && num > currentItem.open_qty) {
                        setErrors((prev) => ({
                          ...prev,
                          [currentItem.order_id]: `Cannot pick more than ${currentItem.open_qty}`,
                        }))
                      } else {
                        setErrors((prev) => {
                          const { [currentItem.order_id]: _, ...rest } = prev
                          return rest
                        })
                      }

                      handlePickedChange(currentItem.order_id, num)
                    }
                  }}
                  className='mt-1 w-full'
                />
                {errors[currentItem.order_id] && (
                  <p className='mt-1 text-xs text-red-500'>
                    {errors[currentItem.order_id]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky Bottom Navigation */}
      {currentItem && step < summarizedItems.length && (
        <div className='fixed bottom-0 left-0 right-0 my-4 flex max-w-sm gap-2 p-2 shadow-lg sm:static sm:w-auto sm:justify-end sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none'>
          <Button
            onClick={prevStep}
            disabled={step === 0}
            className='flex-1'
            variant={step === 0 ? 'secondary' : 'default'}
          >
            Prev
          </Button>

          <Button
            loading={isLoading}
            disabled={errors[currentItem.order_id] !== undefined}
            onClick={
              step === summarizedItems.length - 1 ? handleConfirm : nextStep
            }
            className='flex-1 bg-green-500 text-white hover:bg-green-600'
          >
            {step === summarizedItems.length - 1 ? 'Confirm' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  )
}
