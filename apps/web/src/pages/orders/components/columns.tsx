import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from './headers'

import LongText from '@/components/long-text'
import { SalesOrderItem } from '@/types'
import { useSalesOrder } from '../context/sales-orders-context'
import { format, formatDate } from 'date-fns'
import { id } from 'date-fns/locale'

export const columns: ColumnDef<SalesOrderItem>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const { toggleSelectAll, isSelectAll } = useSalesOrder()
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
      const { isSelected, setSelectedIds } = useSalesOrder()
      const id = row.original.DocNum as unknown as string
      return (
        <div className='flex items-center justify-center'>
          <input
            type='checkbox'
            className='h-4 w-4'
            checked={
              row.getIsSelected() ||
              isSelected(row.original.DocNum as unknown as string)
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
    accessorKey: 'DocNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sales Order' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('DocNum')}</LongText>
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
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Create Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as unknown as Date
      const formattedDate = date
        ? format(date, 'yyyy-MM-dd HH:mm', { locale: id })
        : ''
      return <LongText className='max-w-36'>{formattedDate}</LongText>
    },
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
    id: 'Due Date',
    accessorKey: 'DocDueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      const { DocDueDate } = row.original
      return <LongText className='max-w-36'>{formatDate(DocDueDate, 'yyyy-MM-dd')}</LongText>
    },
    enableSorting: true,
    meta: { className: 'w-36' },
  },
  {
    id: 'Customer',
    accessorKey: 'CardName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('Customer')}</div>
    ),
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: 'TrnspCode',
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    filterFn: 'arrIncludesSome',
  },
  {
    id: 'Area',
    accessorKey: 'TrnspName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('Area')}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'Item',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total SKU' />
    ),

    cell: ({ row }) => {
      const { rawOrders } = useSalesOrder()
      const { DocNum } = row.original

      // Filter rawOrders untuk DocNum ini
      const itemsForOrder = rawOrders.filter((item) => item.DocNum === DocNum)

      // Hitung jumlah SKU unik
      const uniqueSKUs = new Set(itemsForOrder.map((item) => item.ItemCode))

      return <LongText className='max-w-36'>{uniqueSKUs.size}</LongText>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'Comments',
    accessorKey: 'Comments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remarks' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('Comments')}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
]
