import { useEffect, useRef, useState } from 'react'
import {
  ColumnDef,
  RowData,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { usePickList } from '../context/pick-list-context'
import { PickListItem } from '@/types'
// import { DataTableToolbar } from './toolbar'
// import { DataTablePagination } from './pagination'
import { DataTableToolbar } from './toolbar'
import { DataTablePagination } from './pagination'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<PickListItem>[]
}

export function PickListTable({ columns }: DataTableProps) {
  // const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    TrnspCode: false,
  })

  const {
    pagination,
    setPagination,
    total,
    isLoading,
    filters,
    setFilters,
    sortOptions,
    setSortOptions,
    pickLists,
    updatePrintStatus,
  } = usePickList()
  const processedIdsRef = useRef(new Set<number>())
  const table = useReactTable({
    data: pickLists,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      sorting: sortOptions,
      columnVisibility,
      columnFilters: filters,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: true,
    manualFiltering: true,
    onSortingChange: setSortOptions,
    onColumnFiltersChange: setFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: setPagination,
    enableSortingRemoval: true,
  })

  const handlePrintMessage = async (e: MessageEvent) => {
    if (e.data?.type !== 'PRINT_DONE') return
    const id = e.data.id
    if (processedIdsRef.current.has(id)) {
      return
    }
    processedIdsRef.current.add(id)
    try {
      await updatePrintStatus(id)
    } catch (err) {
      console.error('❌ Failed to update print status', err)
    }
  }

  useEffect(() => {
    window.addEventListener('message', handlePrintMessage)
    return () => {
      console.log('🧹 Message listener unmounted')
      window.removeEventListener('message', handlePrintMessage)
    }
  }, [updatePrintStatus])

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 p-0 text-center'
                >
                  <div className='flex h-full w-full items-center justify-center'>
                    <Loader2 size={50} className='animate-spin text-gray-500' />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row text-[0.75rem] hover:bg-muted'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
