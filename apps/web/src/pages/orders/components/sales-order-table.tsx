import { useState } from 'react'
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
import { useSalesOrder } from '../context/sales-orders-context'
import { SalesOrderItem } from '@/types'
import { DataTableToolbar } from './toolbar'
import { DataTablePagination } from './pagination'
import { Loader2 } from 'lucide-react'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<SalesOrderItem>[]
}

export function SalesOrderTable({ columns }: DataTableProps) {
  // const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    TrnspCode: false,
  })

  const {
    pagination,
    setPagination,
    salesOrders,
    total,
    filters,
    setFilters,
    sortOptions,
    setSortOptions,
    isLoading,
  } = useSalesOrder()
  const table = useReactTable({
    data: salesOrders,
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
            {table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
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
                ))}

                {/* Row loading */}
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='py-4 text-center'
                    >
                      <Loader2
                        className='mr-2 inline-block animate-spin'
                        size={16}
                      />
                      Loading more...
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <>
                {salesOrders.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='py-4 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='py-4 text-center'
                    >
                      Loading ...
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination />
    </div>
  )
}
