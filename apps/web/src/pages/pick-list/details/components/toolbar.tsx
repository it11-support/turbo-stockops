import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { usePickList } from '../../context/pick-list-context'
import { DataTableFacetedFilter } from './faceted-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const { search, setSearch } = usePickList()
  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Search sales order...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
            clearable
          />

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
