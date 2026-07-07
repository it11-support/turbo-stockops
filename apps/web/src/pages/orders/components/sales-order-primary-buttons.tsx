import { useSalesOrder } from '../context/sales-orders-context'
import { Button } from '@/components/custom/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { IconFileExcel, IconFileExport } from '@tabler/icons-react'
import { format } from 'date-fns'
import {
  RefreshCw,
  ArrowBigRight,
  CalendarIcon,
  XIcon,
  Loader2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

export function SalesOrderPrimaryButtons() {
  const {
    fetchSalesOrders,
    isLoading,
    exportDate,
    setExportDate,
    exportData,
    isLoadingExport,
    setExportData,
  } = useSalesOrder()
  const [openModal, setOpenModal] = useState(false)
  const [openPicker, setOpenPicker] = useState(false)

  const handleExportData = () => {
    const data = exportData.map((row) => ({
      'Order ID': row.DocNum,
      'Create Date': row.DocTime,
      'Due Date': row.DocDueDate,
      Customer: row.CardName,
      Address: row.Address,
      Phone: row.Phone1,
      Area: row.TrnspName,
      Comments: row.Comments,
      'Sales Person': row.SlpName,
      Telemarketing: row.U_NAME,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Orders')

    const filename = exportDate
      ? `SalesOrders-${format(exportDate, 'yyyy-MM-dd')}.xlsx`
      : 'SalesOrders.xlsx'
    XLSX.writeFile(wb, filename)

    setOpenModal(false)
  }

  useEffect(() => {
    if (!openModal) {
      setExportDate(undefined)
    }
    if (!exportDate) {
      setExportData([])
    }
  }, [openModal, exportDate])

  return (
    <>
      <div className='flex gap-2'>
        <Button
          size={'sm'}
          className='space-x-1'
          disabled={isLoading}
          onClick={() => fetchSalesOrders(true)}
        >
          <span>Load Data</span>
          {isLoading ? (
            <RefreshCw className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <RefreshCw className='h-3.5 w-3.5' />
          )}
        </Button>
        <Button
          size={'sm'}
          className='space-x-1'
          onClick={() => setOpenModal(true)}
        >
          <span>Export</span>
          <IconFileExport className='h-3.5 w-3.5' />
        </Button>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Export Sales Order</DialogTitle>
              <DialogDescription>
                Export sales order to excel file
              </DialogDescription>
            </DialogHeader>
            <Popover open={openPicker} onOpenChange={setOpenPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'h-8 w-full justify-between text-left font-normal lg:w-[250px]',
                    !exportDate && 'text-muted-foreground'
                  )}
                >
                  <div className='flex items-center'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {exportDate ? (
                      format(new Date(exportDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </div>

                  {exportDate && (
                    <XIcon
                      className='mx-2 h-4 w-4 text-muted-foreground hover:text-red-500'
                      onClick={(e) => {
                        e.stopPropagation()
                        setExportDate(undefined)
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={exportDate ? new Date(exportDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setExportDate(date)
                      setOpenPicker(false)
                    }
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {exportDate &&
              (isLoadingExport ? (
                <p className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
                  Loading data
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                </p>
              ) : exportData.length > 0 ? (
                <p className='mt-2 text-sm text-muted-foreground'>
                  {exportData.length} orders to export
                </p>
              ) : (
                <p className='mt-2 text-sm text-muted-foreground'>
                  No data to export
                </p>
              ))}

            <DialogFooter className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              {exportData.length > 0 ? (
                <Button
                  onClick={handleExportData}
                  variant='outline'
                  className='bg-success text-white'
                >
                  Export
                  <IconFileExcel className='ml-2 h-3.5 w-3.5' />
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          size={'sm'}
          className='space-x-1'
          onClick={() => (window.location.href = '/pick-list')}
        >
          <span>Pick List</span>
          <ArrowBigRight className='h-4 w-4' />
        </Button>
      </div>
    </>
  )
}
