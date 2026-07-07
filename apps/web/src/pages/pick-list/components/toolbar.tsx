import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { DataTableFacetedFilter } from './faceted-filter'
import { usePickList } from '../context/pick-list-context'
import { useEffect, useRef } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, XIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const inputRef = useRef<HTMLInputElement>(null)
  const { search, setSearch, date, setDate } = usePickList()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            ref={inputRef}
            placeholder='Search pick list...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
            clearable
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'h-8 w-full justify-between text-left font-normal lg:w-[250px]',
                  !date && 'text-muted-foreground'
                )}
              >
                <div className='flex items-center'>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {date ? (
                    format(new Date(date), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </div>

                {date && (
                  <XIcon
                    className='mx-2 h-4 w-4 text-muted-foreground hover:text-red-500'
                    onClick={(e) => {
                      e.stopPropagation()
                      setDate(undefined)
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={date ? new Date(date) : undefined}
                onSelect={(date) => date && setDate(date)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <div className='flex gap-x-2'>
            {table.getColumn('Status') && (
              <DataTableFacetedFilter
                column={table.getColumn('Status')}
                title='Status'
                options={[
                  { label: 'Open', value: 'open' },
                  { label: 'Closed', value: 'closed' },
                ]}
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
      </div>
    </>
  )
}
