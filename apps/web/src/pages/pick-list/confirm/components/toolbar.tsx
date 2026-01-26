import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { useEffect, useRef } from 'react'
import { usePickList } from '../../context/pick-list-context'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { search, setSearch } = usePickList()
  const inputRef = useRef<HTMLInputElement>(null)
  const column = table.getColumn('Status')

  useEffect(() => {
    if (column) {
      column.setFilterValue('picked')
    }
  }, [column])

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
        </div>
      </div>
    </>
  )
}
