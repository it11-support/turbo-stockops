import React, { useEffect, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import api from '@/lib/api'
import { SalesOrderItem } from '@/types'

type DialogType = 'invite' | 'add' | 'edit' | 'delete'

interface SalesPersonContextType {
  search: string
  setSearch: (value: string) => void
  fetchSalesOrders: (masterSalesOrder?: boolean) => Promise<void>
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: SalesOrderItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<SalesOrderItem | null>>
  salesOrders: any[]
  total: number
  isLoading: boolean
  filters: ColumnFiltersState
  setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  sortOptions: SortingState
  setSortOptions: React.Dispatch<React.SetStateAction<SortingState>>
  area: { value: string; label: string }[]
  setArea: React.Dispatch<
    React.SetStateAction<{ value: string; label: string }[]>
  >
}

const SalesPersonContext = React.createContext<SalesPersonContextType | null>(
  null
)

interface Props {
  children: React.ReactNode
}

export default function SalesOrderProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<SalesOrderItem | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [total, setTotal] = useState(0)
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [sortOptions, setSortOptions] = useState<SortingState>([])
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [area, setArea] = useState<{ value: string; label: string }[]>([])

  // API request
  const fetchSalesOrders = async (masterSalesOrder = false) => {
    const params: Record<string, any> = {}
    setIsLoading(true)
    if (!masterSalesOrder) {
      params['page'] = pagination.pageIndex + 1
      params['per_page'] = pagination.pageSize

      if (search) {
        params['search'] = search
      }

      if (filters.length > 0) {
        filters.forEach((f) => {
          if (Array.isArray(f.value)) {
            params[f.id] = f.value.length > 1 ? f.value.join(',') : f.value[0]
          }
        })
      }

      const descSorts = sortOptions.filter((s) => s.desc)
      if (descSorts.length > 0) {
        params['sort'] = descSorts.map((s) => s.id).join(',')
      }
    }

    try {
      const res = await api.get('/orders', { params })
      const { data } = res
      setSalesOrders(data.data?.data || [])
      console.log(data.data?.data)
      setTotal(data.data?.total || 0)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchArea = async () => {
    try {
      const res = await api.get('/area')
      const { data } = res
      const areas = data.data || []
      const areaOptions = areas.map((area: any) => ({
        value: area.TrnspCode,
        label: area.TrnspName,
      }))
      setArea(areaOptions)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    }
  }

  useEffect(() => {
    fetchArea()
  }, [])

  useEffect(() => {
    fetchSalesOrders()
  }, [pagination, debouncedSearch, filters, sortOptions])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <SalesPersonContext.Provider
      value={{
        pagination,
        setPagination,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        salesOrders,
        fetchSalesOrders,
        total,
        search,
        setSearch,
        isLoading,
        filters,
        setFilters,
        sortOptions,
        setSortOptions,
        area,
        setArea,
      }}
    >
      {children}
    </SalesPersonContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSalesOrder = () => {
  const salesOrderContext = React.useContext(SalesPersonContext)

  if (!salesOrderContext) {
    throw new Error('useSalesOrder has to be used within <SalesPersonContext>')
  }

  return salesOrderContext
}
