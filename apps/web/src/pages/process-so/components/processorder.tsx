import { useNavigate, useParams } from 'react-router'
import { useProcessSo } from '../context/process-so-context'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ConfirmSoItem } from '@/types'
import { Button } from '@/components/custom/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ProcessOrder() {
  const { id } = useParams()
  const { processOrder, fetchProcessOrder, confirmSo } = useProcessSo()

  const [picked, setPicked] = useState<Record<string, Record<number, number>>>(
    {}
  )
  const [pickedError, setPickedError] = useState<
    Record<string, Record<number, string>>
  >({})
  const [openSo, setOpenSo] = useState<string[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  const pickedQtySchema = (maxQty: number) =>
    z
      .number()
      .min(0, { message: 'Cannot be less than 0' })
      .max(maxQty, { message: `Cannot be greater than ${maxQty}` })

  useEffect(() => {
    if (id) {
      fetchProcessOrder(Number(id))
    }
  }, [id])

  const handlePickedChange = (
    soNumber: string,
    id: number,
    value: number,
    maxQty: number
  ) => {
    const result = pickedQtySchema(maxQty).safeParse(value)

    if (!result.success) {
      // simpan error
      setPickedError((prev) => ({
        ...prev,
        [soNumber]: {
          ...(prev[soNumber] ?? {}),
          [id]: result.error.errors[0]?.message ?? '',
        },
      }))
    } else {
      // hapus error
      setPickedError((prev) => {
        const { [id]: _, ...restIds } = prev[soNumber] ?? {}
        return {
          ...prev,
          [soNumber]: restIds,
        }
      })
    }

    setPicked((prev) => ({
      ...prev,
      [soNumber]: {
        ...(prev[soNumber] ?? {}),
        [id]: value,
      },
    }))
  }

  const handleConfirmAll = () => {
    const newPicked: Record<string, Record<number, number>> = {}
    const newOpen: string[] = []

    Object.entries(processOrder).forEach(([soNumber, items]) => {
      newOpen.push(soNumber)

      newPicked[soNumber] = {}
      items.forEach((item) => {
        newPicked[soNumber][item.id] = item.demand - item.openQty
      })
    })

    setPicked(newPicked)
    setOpenSo(newOpen)
  }

  const handleConfirmSo = async () => {
    const data = Object.values(picked).flatMap((innerObj) =>
      Object.entries(innerObj).map(([key, value]) => ({
        id: Number(key),
        value,
      }))
    )
    await confirmSo(id, data).then(() => {
      navigate(-1)
    })
  }

  const totalDemand = Object.entries(processOrder).reduce(
    (total, [, items]: [string, ConfirmSoItem[]]) =>
      total + items.reduce((sum, item) => sum + item.demand, 0),
    0
  )

  const totalPicked = Object.values(picked).reduce(
    (sum, soItems) => sum + Object.values(soItems).reduce((s, q) => s + q, 0),
    0
  )

  const hasError = Object.values(pickedError).some((soErrors) =>
    Object.values(soErrors).some((msg) => !!msg)
  )
  console.log(processOrder, picked)
  return !Object.keys(processOrder).length ? (
    <Loader2 size={40} className='mx-auto my-5 animate-spin' />
  ) : (
    <div className='space-y-4'>
      <Accordion
        type='multiple'
        value={openSo}
        onValueChange={(values) => setOpenSo(values as string[])}
        className='space-y-4'
      >
        {Object.entries(processOrder).map(
          ([soNumber, items]: [string, ConfirmSoItem[]]) => (
            <SalesOrderCard
              key={soNumber}
              soNumber={soNumber}
              items={items}
              picked={picked}
              pickedError={pickedError}
              onPickedChange={handlePickedChange}
            />
          )
        )}
      </Accordion>

      <div className='flex items-center justify-start space-x-2'>
        <Button variant='outline' onClick={() => window.history.back()}>
          <IconArrowLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button variant='outline' onClick={handleConfirmAll}>
          Confirm All
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={hasError}
              className='space-x-1 bg-green-700 hover:bg-green-600'
              variant={'outline'}
            >
              <IconDeviceFloppy className='mr-2 h-4 w-4' />
              Submit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Sales Order</DialogTitle>
              <DialogDescription>
                This action will update the sales order details
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <p>
                Are you sure you want to update {totalPicked} items out of{' '}
                {totalDemand} items in the sales order?
              </p>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={handleConfirmSo}
                className='bg-green-700 hover:bg-green-600'
              >
                Submit
              </Button>
              <Button
                variant={'outline'}
                onClick={() => setOpen(false)}
                className=''
              >
                No
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function SalesOrderCard({
  soNumber,
  items,
  picked,
  pickedError,
  onPickedChange,
}: {
  soNumber: string
  items: ConfirmSoItem[]
  picked: Record<string, Record<number, number>>
  pickedError: Record<string, Record<number, string>>
  onPickedChange: (
    soNumber: string,
    id: number,
    value: number,
    maxQty: number
  ) => void
}) {
  return (
    <AccordionItem value={soNumber} className='rounded-lg border'>
      <AccordionTrigger className='px-4 py-2 font-semibold hover:no-underline'>
        <div className='space-y-1'>
          <div className='flex items-center space-x-2'>
            <div className='text-lg font-bold'>Sales Order #{soNumber}</div>
            <div className='text-sm text-muted-foreground'>
              {items.length === 1 ? '1 item' : `${items.length} items`}
            </div>
          </div>
          <div className='font-semibold text-muted-foreground'>
            {items[0].customer} ({items[0].customerCode}) | {items[0].area}
          </div>
          <div className='text-xs text-muted-foreground'>
            {format(new Date(items[0].dueDate), 'dd MMM yyyy')}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className='space-y-4 p-4'>
        {items.map((item) => {
          const pickedQty = picked[soNumber]?.[item.id] ?? 0
          const progress = item.demand > 0 ? (pickedQty / item.demand) * 100 : 0

          return (
            <div
              key={item.id}
              className='space-y-3 rounded-lg border bg-muted/50 p-4'
            >
              <div className='font-medium'>{item.itemName}</div>
              <div className='text-sm text-muted-foreground'>
                SO Qty: {item.demand} | Open Qty:{' '}
                {pickedQty > item.demand ? 0 : item.demand - pickedQty}{' '}
                {item.unit}
              </div>

              <div className='flex items-center gap-3'>
                <Label
                  htmlFor={`picked-${item.id}`}
                  className='whitespace-nowrap'
                >
                  Picked
                </Label>
                <Input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={pickedQty}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '')
                    const value = onlyNums === '' ? 0 : Number(onlyNums)
                    onPickedChange(soNumber, item.id, value, item.demand)
                  }}
                  className={`w-24 ${
                    pickedError[item.id]
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                />
                {pickedError[soNumber]?.[item.id] && (
                  <p className='text-sm text-red-500'>
                    {pickedError[soNumber][item.id]}
                  </p>
                )}
              </div>

              {progress > 0 && progress <= 100 && (
                <div className='relative w-full'>
                  <Progress
                    value={progress}
                    className='h-1 bg-background [&>div]:bg-green-500'
                  />
                  <span className='absolute right-0 top-0 -translate-y-6 text-sm font-medium text-gray-400'>
                    {progress.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </AccordionContent>
    </AccordionItem>
  )
}
