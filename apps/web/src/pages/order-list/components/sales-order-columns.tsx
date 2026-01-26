import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import LongText from '@/components/long-text'
import { SalesOrderItem } from '@/types'

export const columns: ColumnDef<SalesOrderItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'DocNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('DocNum')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'DocDueDate',
    accessorKey: 'DocDueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      const { DocDueDate } = row.original
      return <LongText className='max-w-36'>{DocDueDate}</LongText>
    },
    enableSorting: true,
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'CardName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('CardName')}</div>
    ),
  },
  {
    accessorKey: 'TrnspCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area Code' />
    ),
    cell: () => null,
    enableSorting: false,
    enableHiding: true,
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: 'TrnspName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('TrnspName')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'ItemCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Item Code' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('ItemCode')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'Dscription',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Item' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('Dscription')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'Quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Quantity' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('Quantity')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'unitMsr',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('unitMsr')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
