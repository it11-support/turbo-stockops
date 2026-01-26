import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from '@radix-ui/react-icons'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/custom/button'
import { usePickList } from '../../context/pick-list-context'

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { setSortOptions, sortOptions, setPagination } = usePickList()

  const handleToggleSort = (columnId: string) => {
    setSortOptions((prev) => {
      setPagination({ pageIndex: 0, pageSize: 20 })
      const existing = prev.find((s) => s.id === columnId)

      if (!existing) {
        // Belum ada sorting → jadikan asc
        return [{ id: columnId, desc: false }]
      }

      if (existing && !existing.desc) {
        // Sudah asc → ubah ke desc
        return [{ id: columnId, desc: true }]
      }

      // Sudah desc → hapus (reset)
      return []
    })
  }

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorting = sortOptions.find((o) => o.id === column.id)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='data-[state=open] -ml-3 h-8'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleToggleSort(column.id)
            }}
          >
            <span>{title}</span>
            {sorting ? (
              sorting.desc ? (
                <ArrowDownIcon className='ml-2 h-4 w-4' />
              ) : (
                <ArrowUpIcon className='ml-2 h-4 w-4' />
              )
            ) : (
              <CaretSortIcon className='ml-2 h-4 w-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  )
}
