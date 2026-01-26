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
import { useUsers } from '../context/users-context'
import { useEffect } from 'react'

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
  const { setSortOptions, sortOptions } = useUsers()

  const handleToggleSort = (columnId: string) => {
    setSortOptions((prev) => {
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

  useEffect(() => {
    console.log(sortOptions)
  }, [sortOptions])

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
        {/* <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={() => {
            column.toggleSorting(false, true)
            const id = column.id
            setSortOptions((prev) => {
              const other = prev.filter((item) => item.id !== id)
              return [...other, { id, desc: false }]
            })
          }}  
          >
            <ArrowUpIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              column.toggleSorting(true, true)
              const id = column.id
              setSortOptions((prev) => {
                const other = prev.filter((item) => item.id !== id)
                return [...other, { id, desc: true }]
              })
            }}
            >
            <ArrowDownIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false) }>
                <EyeNoneIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent> */}
      </DropdownMenu>
    </div>
  )
}
