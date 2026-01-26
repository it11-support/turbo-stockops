import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

import LongText from '@/components/long-text'
import { SalesOrderSummary } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { DataTableColumnHeader } from './headers'
import { usePickList } from '../../context/pick-list-context'

export const columns: ColumnDef<SalesOrderSummary>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const { toggleSelectAll, isSelectAll } = usePickList()
      return (
        <div className='flex items-center justify-center'>
          <input
            type='checkbox'
            className='h-4 w-4'
            checked={isSelectAll || table.getIsAllPageRowsSelected()}
            onChange={(e) => toggleSelectAll(!!e.target.checked)}
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const { isSelected, setSelectedIds } = usePickList()
      const id = row.original.sales_order_id as unknown as string
      return (
        <div className='flex items-center justify-center'>
          <input
            type='checkbox'
            className='h-4 w-4'
            checked={
              row.getIsSelected() ||
              isSelected(row.original.sales_order_id as unknown as string)
            }
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((prev) => [...prev, id]) // tambahkan ke array
              } else {
                setSelectedIds((prev) => prev.filter((i) => i !== id)) // hapus dari array
              }
            }}
          />
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell'
      ),
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'sales_order_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sales Order' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('sales_order_id')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-8 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'sales_order_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Create Date' />
    ),
    cell: ({ row }) => {
      const raw = row.getValue('sales_order_date') as string | null

      const parsedDate = raw ? new Date(raw.replace(' ', 'T')) : null

      const formattedDate =
        parsedDate && !isNaN(parsedDate.getTime())
          ? format(parsedDate, 'yyyy-MM-dd HH:mm', { locale: id })
          : ''

      return <LongText className='max-w-36'>{formattedDate}</LongText>
    },
    enableHiding: false,
  },
  {
    id: 'delivery_date',
    accessorKey: 'delivery_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      const { delivery_date } = row.original
      return <LongText className='max-w-36'>{delivery_date}</LongText>
    },
    enableSorting: true,
    meta: { className: 'w-36' },
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('customer_name')}</div>
    ),
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: 'area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('area')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    filterFn: 'arrIncludesSome',
  },
  {
    id: 'total_sku',
    accessorKey: 'total_sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total SKU' />
    ),

    cell: ({ row }) => {
      const { total_sku } = row.original
      return <LongText className='max-w-36'>{total_sku}</LongText>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'remarks',
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remarks' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('remarks')}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
]
