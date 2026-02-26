import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from './headers'

import LongText from '@/components/long-text'
import { PickListDetail } from '@/types'

export const columns: ColumnDef<PickListDetail>[] = [
  {
    accessorFn: (row) => row.order.item.RackNo || row.rack_no,
    accessorKey: 'rackNo',
    header: ({ column }) => (
      <DataTableColumnHeader
        className='min-w-[5rem]'
        column={column}
        title='Rack No'
      />
    ),
    meta: {
      className: cn(
        'min-w-[5rem] drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell'
      ),
    },
  },
  {
    accessorKey: 'item_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Item Code' />
    ),
    cell: ({ row }) => (
      <>
        <LongText className='max-w-36'>{row.getValue('item_code')}</LongText>
      </>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'barcode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Barcode' />
    ),
    cell: ({ row }) => (
      <>
        <LongText className='max-w-36'>{row.getValue('barcode')}</LongText>
      </>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'item_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Item Name' />
    ),
    cell: ({ row }) => {
      //   const { DocDueDate } = row.original
      return <LongText>{row.getValue('item_name')}</LongText>
    },
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader className='max-w-20' column={column} title='UOM' />
    ),
    cell: ({ row }) => {
      return <LongText className='max-w-36'>{row.getValue('unit')}</LongText>
    },
    enableHiding: true,
  },
  {
    accessorKey: 'demand',
    header: ({ column }) => (
      <DataTableColumnHeader
        className='max-w-20'
        column={column}
        title='Demand'
      />
    ),
    cell: ({ row }) => {
      return <LongText className='max-w-36'>{row.getValue('demand')}</LongText>
    },
    enableHiding: true,
  },
  {
    accessorKey: 'open_qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Open Qty' />
    ),
    cell: ({ row }) => {
      return (
        <LongText className='max-w-50'>{row.getValue('open_qty')}</LongText>
      )
    },
    meta: { className: 'w-50' },
  },
  {
    accessorKey: 'picked',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Qty Picked' />
    ),
    cell: ({ row }) => {
      return <LongText className='max-w-50'>{row.getValue('picked')}</LongText>
    },
    meta: { className: 'w-50' },
  },
]
