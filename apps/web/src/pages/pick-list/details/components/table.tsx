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
import { Loader2 } from 'lucide-react'
import { PickListDetail } from '@/types'
// import { DataTableToolbar } from './toolbar'
// import { DataTablePagination } from './pagination'
import { DataTablePagination } from './pagination'
import { usePickList } from '../../context/pick-list-context'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<PickListDetail>[]
}

export function PickListDetailTable({ columns }: DataTableProps) {
  // const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    TrnspCode: false,
  })

  const {
    pagination,
    setPagination,
    totalDetail,
    isLoading,
    filters,
    setFilters,
    sortOptions,
    setSortOptions,
    details,
  } = usePickList()

  // Group by item code
  const groupedData: PickListDetail[] = details.reduce(
    (acc: PickListDetail[], item: PickListDetail) => {
      const code = item.order.ItemCode
      const barcode = item.order.item.Barcode
      const existing = acc.find((i) => i.order.ItemCode === code)

      if (existing) {
        existing.demand = Number(existing.demand) + Number(item.demand)
        existing.picked = Number(existing.picked) + Number(item.picked)
        existing.open_qty = Number(existing.open_qty) + Number(item.open_qty)
        existing.barcode = existing.barcode ? existing.barcode : barcode
      } else {
        acc.push({
          ...item,
          barcode,
          demand: Number(item.demand),
          picked: Number(item.picked),
          open_qty: Number(item.open_qty),
        })
      }

      return acc
    },
    []
  )

  const table = useReactTable({
    data: groupedData,
    columns,
    pageCount: Math.ceil(totalDetail / pagination.pageSize),
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
