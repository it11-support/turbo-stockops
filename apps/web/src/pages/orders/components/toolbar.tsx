import { CalendarIcon, Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { useSalesOrder } from '../context/sales-orders-context'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { XIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const { search, setSearch, area, dueDate, setDueDate, customer, orderIds } =
    useSalesOrder()
  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Search sales order...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 w-full min-w-[160px] lg:w-[300px]'
            clearable
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'h-8 w-full justify-between text-left font-normal lg:w-[250px]',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <div className='flex items-center'>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dueDate ? (
                    format(new Date(dueDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </div>

                {dueDate && (
                  <XIcon
                    className='mx-2 h-4 w-4 text-muted-foreground hover:text-red-500'
                    onClick={(e) => {
                      e.stopPropagation()
                      setDueDate(undefined)
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(date) => date && setDueDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className='flex gap-x-2'>
            {table.getColumn('DocNum') && (
              <DataTableFacetedFilter
                column={table.getColumn('DocNum')}
                title='Sales Order'
                options={orderIds.map((t) => ({ ...t }))}
              />
            )}
          </div>
          <div className='flex gap-x-2'>
            {table.getColumn('TrnspCode') && (
              <DataTableFacetedFilter
                column={table.getColumn('TrnspCode')}
                title='Area'
                options={area.map((t) => ({ ...t }))}
              />
            )}
          </div>
          <div className='flex gap-x-2'>
            {table.getColumn('Customer') && (
              <DataTableFacetedFilter
                column={table.getColumn('Customer')}
                title='Customer'
                options={customer.map((t) => ({ ...t }))}
              />
            )}
          </div>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </>
  )
}
