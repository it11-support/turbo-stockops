import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from './headers'

import LongText from '@/components/long-text'
import { PickListItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { DataTableRowActions } from './actions'
import { Link } from 'react-router'
import { ExternalLinkIcon } from 'lucide-react'

export const columns: ColumnDef<PickListItem>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pick List Code' />
    ),
    cell: ({ row }) => (
      <>
        <Link
          to={`/pick-list/${row.original.id}/details`}
          className='underline'
        >
          <LongText className='flex max-w-36 items-center'>
            {row.getValue('code')}{' '}
            <span className='ml-2'>
              <ExternalLinkIcon size={16} />
            </span>
          </LongText>
        </Link>
      </>
    ),
    meta: {
      className: cn(
        'w-36 drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'md:table-cell'
      ),
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    id: 'Assignee',
    accessorKey: 'assigned_to.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assignee' />
    ),
    cell: ({ row }) => {
      //   const { DocDueDate } = row.original
      return (
        <LongText className='max-w-36'>{row.getValue('Assignee')}</LongText>
      )
    },
    enableSorting: true,
  },
  {
    id: 'Status',
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        className='max-w-20'
        column={column}
        title='Status'
      />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor =
        status === 'open'
          ? 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'
          : 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'
      return (
        <div className='flex max-w-20'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {row.getValue('Status')}
          </Badge>
        </div>
      )
    },

    enableSorting: true,
    enableHiding: true,
    filterFn: 'arrIncludesSome',
    meta: { className: 'w-20' },
  },
  {
    id: 'Notes',
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => {
      return <LongText className='max-w-50'>{row.getValue('Notes')}</LongText>
    },
    enableSorting: false,
    meta: { className: 'w-50' },
  },
  {
    id: 'Started',
    accessorKey: 'started_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Started' />
    ),
    cell: ({ row }) => {
      const { start_at } = row.original
      const text = start_at
        ? format(start_at, 'dd/MM/yyyy HH:mm')
        : 'Not Started     '
      return <div className='w-fit text-nowrap'>{text}</div>
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'Completed',
    accessorKey: 'complete_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Completed' />
    ),
    cell: ({ row }) => {
      const { complete_at } = row.original
      const text = complete_at ? format(complete_at, 'dd/MM/yyyy HH:mm') : ''
      return <div className='w-fit text-nowrap'>{text}</div>
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
