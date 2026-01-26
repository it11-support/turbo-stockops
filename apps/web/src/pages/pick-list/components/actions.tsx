import { Row } from '@tanstack/react-table'
import { IconArrowsSplit, IconPrinter } from '@tabler/icons-react'
import { Button } from '@/components/custom/button'
import { PickListItem } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import PickListPrint from './PickListPrint'
import { usePickList } from '../context/pick-list-context'
import { Loader2, PlayIcon } from 'lucide-react'
import { SoTable } from './salesorder/table'
import { columns } from './salesorder/columns'

interface DataTableRowActionsProps {
  row: Row<PickListItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Row<PickListItem> | null>(
    null
  )
  const {
    fetchPickListById,
    pickListDetail,
    loadingDetail,
    fetchSalesOrdersByPickListId,
    salesOrders,
    selectedIds,
    setSelectedIds,
    splitPickList,
  } = usePickList()
  const [openSplitModal, setOpenSplitModal] = useState(false)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const handlePrint = (() => {
    let isPrinting = false

    return () => {
      if (isPrinting || !selectedItem?.original?.id) return
      isPrinting = true

      const printContents = document.getElementById('print-area')?.innerHTML
      if (!printContents) {
        isPrinting = false
        return
      }

      const printId = selectedItem.original.id
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        isPrinting = false
        return
      }

      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((node) => node.outerHTML)
        .join('\n')

      printWindow.document.write(`
      <html>
        <head>
          <title>Print Pick List ${pickListDetail?.code ?? ''}</title>
          ${styles}
          <style>
            @media print {
              @page { size: A5 portrait; margin: 0 0 0.5cm 0; }
              .print-page-break { page-break-before: always; break-before: page; }
              .print-page-break:not(:first-of-type) { padding-top: 0.5cm; }

              html, body { margin:0!important; padding:0!important; background:#fff!important; color:#000!important; font-size:12px!important; width:100%; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
              html h2 { font-size:20px!important; }
              .print-container { padding:0.5cm; }
              .spacer-row:not(:first-of-type) td { height:0.5cm; }
              table { width:100%; border-collapse:collapse; page-break-inside:auto; border:none!important; }
              thead { background-color:#e5e7eb!important; }
              th, td { border:0.5px solid #000; padding:2px; text-align:left; font-size:13px!important;}
              tr { page-break-inside:avoid; page-break-after:auto; }
              .no-print { display:none!important; }
              .signature-section { padding-top:20px !important; display:flex; justify-content:space-around; }
              td:nth-child(3), th:nth-child(3) {
                font-size: 11.5px !important;
              }
              .customer-details {
                font-size: 14px !important;  
              }
              
              .sales-order {
                font-size: 12.5px !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="print-area">${printContents}</div>
         <script>
            const printKey = 'printed_' + ${printId};

            window.onload = function() {
              if (!sessionStorage.getItem(printKey)) {
                window.print();
              }
            };

            window.onafterprint = function() {
              if (!sessionStorage.getItem(printKey)) {
                sessionStorage.setItem(printKey, 'true');
                window.opener.postMessage({ type: "PRINT_DONE", id: ${printId} }, "*");
                window.close();
              }
            };
          </script>
        </body>
      </html>
    `)

      printWindow.document.close()
      printWindow.focus()

      // Reset flag after some time in case print fails
      setTimeout(() => {
        isPrinting = false
      }, 10000)
    }
  })()

  useEffect(() => {
    if (!open) {
      setSelectedItem(null)
    }
  }, [open])

  useEffect(() => {
    if (open && selectedItem) {
      fetchPickListById(Number(selectedItem.original.id))
      fetchSalesOrdersByPickListId(Number(selectedItem.original.id))
    }
  }, [open])

  useEffect(() => {
    if (openSplitModal && selectedItem) {
      fetchSalesOrdersByPickListId(Number(selectedItem.original.id))
    }
    if (!openSplitModal) {
      setSelectedIds([])
    }
  }, [openSplitModal])

  const handleSplit = async () => {
    if (selectedItem?.original?.id) {
      const id = selectedItem.original.id
      await splitPickList(id, selectedIds)
    }
  }

  return (
    <>
      <div className='flex gap-2'>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size={'icon'}
              key={row.id}
              variant='outline'
              className='flex h-8 w-8 cursor-pointer p-0 data-[state=open]:bg-muted'
              onClick={() => {
                setOpen(true)
                setSelectedItem(row)
              }}
            >
              <IconPrinter className='h-5 w-5' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='grid max-h-[80%] max-w-[900px] grid-rows-[auto,1fr,auto] print:hidden'>
            <DialogHeader className='print:hidden'>
              <DialogTitle>Print Pick List & Sales Order</DialogTitle>
              <DialogDescription>
                Ensure the details are correct before printing.
              </DialogDescription>
            </DialogHeader>

            {loadingDetail ? (
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>
                  Loading content...{' '}
                </span>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              ''
            )}
            <div className='overflow-y-auto'>
              {!loadingDetail && pickListDetail && salesOrders && (
                <PickListPrint />
              )}
            </div>
            <DialogFooter className='flex shrink-0 !justify-start border-t pt-4'>
              <Button
                onClick={handlePrint}
                className=' rounded px-4 py-2 text-white'
                type='button'
                variant={'outline'}
              >
                <span className='mr-2'>Print </span> <IconPrinter size={16} />
              </Button>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* {!row.original.start_at && row.original.status === 'open' && (
        <div className='flex gap-2'>
          <Button size={'sm'} onClick={() => { window.location.href = `/pick-list/${row.original.id}/process` }} className=" text-foreground text-xs px-4 py-2 rounded" type='button' variant={'outline'}>
            <span className='mr-2'>Process Picking </span> <PlayIcon size={16} />
          </Button>
        </div>
      )} */}

        <Dialog open={openSplitModal} onOpenChange={setOpenSplitModal}>
          <DialogTrigger asChild>
            <Button
              size={'icon'}
              key={row.id}
              variant='outline'
              className='flex h-8 w-8 cursor-pointer p-0 data-[state=open]:bg-muted'
              onClick={() => {
                setOpenSplitModal(true)
                setSelectedItem(row)
              }}
            >
              <IconArrowsSplit className='h-5 w-5' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='grid h-[90vh] max-h-[90%] w-[95vw] max-w-[900px] grid-rows-[auto,1fr,auto] print:hidden'>
            <DialogHeader className='print:hidden'>
              <DialogTitle className='text-base sm:text-lg'>
                Split Pick List
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm'>
                Split existing Pick List or move to another Pick List.
              </DialogDescription>
            </DialogHeader>

            {/* Bagian tengah fleksibel */}
            <div className='overflow-y-auto'>
              <p className='mb-2 text-xs text-muted-foreground sm:text-sm'>
                Choose items to move to a new <b>Pick List</b>.
              </p>
              {loadingDetail ? (
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold'>
                    Loading content...{' '}
                  </span>
                  <Loader2 className='h-4 w-4 animate-spin' />
                </div>
              ) : (
                salesOrders && (
                  <div className='overflow-x-auto'>
                    <div className='min-w-[700px]'>
                      {' '}
                      {/* << penting */}
                      <SoTable columns={columns} />
                    </div>
                  </div>
                )
              )}
            </div>

            <DialogFooter className='flex shrink-0 flex-col !justify-start gap-2 border-t pt-4 sm:flex-row'>
              {selectedIds.length > 0 && (
                <Button
                  onClick={() => {
                    setOpenConfirmModal(true)
                  }}
                  className='w-full rounded px-4 py-2 text-white sm:w-auto'
                  type='button'
                  variant='outline'
                >
                  <span className='mr-2'>Split</span>
                  <IconArrowsSplit size={16} />
                </Button>
              )}
              <Button
                variant='outline'
                onClick={() => setOpenSplitModal(false)}
                className='w-full sm:w-auto'
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Confirm Split Pick List</DialogTitle>
              <DialogDescription>
                This action will move <b>{selectedIds.length}</b> item(s) to a
                new Pick List.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setOpenConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSplit()
                }} // function API call to backend
                variant='outline'
                className='bg-success text-white'
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {row.original.status === 'picked' && (
          <div className='flex gap-2'>
            <Button
              size={'sm'}
              onClick={() => {
                window.location.href = `/order/${row.original.id}/process`
              }}
              className=' rounded px-4 py-2 text-xs text-foreground'
              type='button'
              variant={'outline'}
            >
              <span className='mr-2'>Confirm </span> <PlayIcon size={16} />
            </Button>
          </div>
        )}
        <div id='print-area' className='hidden print:block'>
          {!loadingDetail && pickListDetail && (
            <>
              <PickListPrint />
            </>
          )}
        </div>
      </div>
    </>
  )
}
