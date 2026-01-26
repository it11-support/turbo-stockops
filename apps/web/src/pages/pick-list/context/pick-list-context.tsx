import React, { useEffect, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import api from '@/lib/api'
import {
  PickListDetail,
  PickListItem,
  SalesOrderSummary,
  Summary,
} from '@/types'
import { useLocation, useParams } from 'react-router-dom'
import { format } from 'date-fns'

type DialogType = 'print' | 'add' | 'edit' | 'delete'

let fetchTimeout: ReturnType<typeof setTimeout> | null = null
interface PickListContextType {
  search: string
  setSearch: (value: string) => void
  pagination: PaginationState
  pickLists: PickListItem[]
  setPickLists: React.Dispatch<React.SetStateAction<PickListItem[]>>
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: PickListItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PickListItem | null>>
  total: number
  isLoading: boolean
  filters: ColumnFiltersState
  setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  sortOptions: SortingState
  setSortOptions: React.Dispatch<React.SetStateAction<SortingState>>
  fetchPickListById: (id: number) => Promise<void>
  pickListDetail: Summary | null
  setPickListDetail: React.Dispatch<React.SetStateAction<Summary | null>>
  loadingDetail: boolean
  setLoadingDetail: React.Dispatch<React.SetStateAction<boolean>>
  salesOrders: SalesOrderSummary[] | []
  setSalesOrders: React.Dispatch<React.SetStateAction<SalesOrderSummary[] | []>>
  fetchSalesOrdersByPickListId: (id: number) => Promise<void>
  details: PickListDetail[] | []
  setDetails: React.Dispatch<React.SetStateAction<PickListDetail[] | []>>
  totalDetail: number
  date?: Date
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  setTotalDetail: React.Dispatch<React.SetStateAction<number>>
  fetchPickListDetails: (paging: boolean) => Promise<void>
  currentProcessPickList: PickListDetail[] | []
  setCurrentProcessPickList: React.Dispatch<
    React.SetStateAction<PickListDetail[] | []>
  >
  updatePickingStatus: (id: string) => Promise<void>
  updatePickedItems: (
    items: { order_id: string; picked: number | undefined }[],
    start_time: string | null
  ) => Promise<void>
  updatePrintStatus: (id: number) => Promise<void>
  toggleSelectAll: (checked: boolean) => void
  isSelectAll: boolean
  setIsSelectAll: React.Dispatch<React.SetStateAction<boolean>>
  isSelected: (id: string) => boolean
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  salesOrderIds: string[]
  setSalesOrderIds: React.Dispatch<React.SetStateAction<string[]>>
  splitPickList: (id: string, selectedIds: string[]) => Promise<void>
}

const PickListContext = React.createContext<PickListContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PickListProvider({ children }: Props) {
  const { id } = useParams()
  const { pathname } = useLocation()
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<PickListItem | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [sortOptions, setSortOptions] = useState<SortingState>([])
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [pickLists, setPickLists] = useState<PickListItem[]>([])
  const [pickListDetail, setPickListDetail] = useState<Summary | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [salesOrders, setSalesOrders] = useState<SalesOrderSummary[] | []>([])
  const [details, setDetails] = useState<PickListDetail[] | []>([])
  const [totalDetail, setTotalDetail] = useState(0)
  const [currentProcessPickList, setCurrentProcessPickList] = useState<
    PickListDetail[] | []
  >([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [salesOrderIds, setSalesOrderIds] = useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)

  // API request

  useEffect(() => {
    if (
      selectedIds.length === salesOrderIds.length &&
      salesOrderIds.length > 0
    ) {
      setIsSelectAll(true)
    } else {
      setIsSelectAll(false)
    }
  }, [selectedIds, salesOrderIds])

  const splitPickList = async (id: string, selectedIds: string[]) => {
    try {
      setIsLoading(true)
      await api.post(`/picklist/${id}/split`, { selectedIds })
      await fetchPickLists()
    } catch (error) {
      console.error('Failed to update picking status:', error)
    }
  }
  const updatePrintStatus = async (id: number) => {
    try {
      setIsLoading(true)
      await api.post(`/picklist/printed`, { id })
      await fetchPickLists()
    } catch (error) {
      console.error('Failed to update picking status:', error)
    }
  }
  const toggleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedIds(salesOrderIds)
    } else {
      setSelectedIds([])
    }
  }

  const isSelected: (id: string) => boolean = (id) => selectedIds.includes(id)

  const updatePickedItems = async (
    items: { order_id: string; picked: number | undefined }[],
    start_time: string | null
  ) => {
    try {
      setIsLoading(true)
      await api.post(`/picklist/${id}/update-picked-items`, {
        items,
        start_time,
      })
    } catch (error) {
      console.error('Failed to update picking status:', error)
    } finally {
      setIsLoading(false)
    }
  }
  async function updatePickingStatus(id: string) {
    try {
      setIsLoading(true)
      await api.put(`/picklist/${id}`, { status: 'picking' })
      await fetchPickLists()
    } catch (error) {
      console.error('Failed to update picking status:', error)
    }
  }

  async function fetchPickLists() {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }

    fetchTimeout = setTimeout(async () => {
      setIsLoading(true)
      const params: any = {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }

      if (search) {
        params['search'] = search
      }

      if (filters.length > 0) {
        filters.forEach((f) => {
          if (Array.isArray(f.value)) {
            params[f.id] = f.value.length > 1 ? f.value.join(',') : f.value[0]
          } else if (f.value) {
            params[f.id] = f.value
          }
        })
      }

      if (sortOptions.length > 0) {
        const sort = sortOptions[0]
        params['sortBy'] = sort.id
        params['sortDesc'] = sort.desc
      }

      if (date) {
        params['date'] = format(date, 'yyyy-MM-dd')
      }

      try {
        const res = await api.get('/picklists', { params })
        const { data } = res
        setPickLists(data.data?.data || [])
        setTotal(data.data?.total || 0)
      } catch (error) {
        console.error('Failed to fetch pick lists:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300) // delay 300ms
  }

  const fetchPickListById = async (id: number) => {
    try {
      setLoadingDetail(true)
      const res = await api.get(`/picklist/${id}`)
      const { data } = res
      setPickListDetail(data.data.summary)
    } catch (error) {
      console.error('Failed to fetch sales person:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function fetchPickListDetails(paging = true) {
    setIsLoading(true)
    const params: any = {
      ...(paging && {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }),
    }

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

    if (sortOptions.length > 0) {
      const sort = sortOptions[0]
      params['sortBy'] = sort.id
      params['sortDesc'] = sort.desc
    }

    if (paging) {
      params['paging'] = paging
    }

    try {
      const res = await api.get(`/picklist/${id}/details`, { params })
      const { data } = res
      if (paging) {
        setDetails(data.data?.data || [])
        setTotalDetail(data.data?.total || 0)
      } else {
        console.log(data.data)
        setCurrentProcessPickList(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSalesOrdersByPickListId = async (id: number) => {
    try {
      setLoadingDetail(true)
      const res = await api.get(`/orders/${id}`)
      const { data } = res
      setSalesOrders(data.data)
      setSalesOrderIds(data.data.map((o: any) => o.sales_order_id))
    } catch (error) {
      console.error('Failed to fetch sales person:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    if (id) {
      let paging = false
      if (pathname.includes('details')) {
        paging = true
      } else if (pathname.includes('process')) {
        paging = false
      }
      fetchPickListDetails(paging)
    }
  }, [id, pagination, debouncedSearch, filters, sortOptions])

  useEffect(() => {
    if (!id) {
      fetchPickLists()
    }
  }, [pagination, debouncedSearch, filters, sortOptions, date])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination({ pageIndex: 0, pageSize: 20 })
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <PickListContext.Provider
      value={{
        pagination,
        setPagination,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        total,
        search,
        setSearch,
        isLoading,
        filters,
        setFilters,
        sortOptions,
        setSortOptions,
        pickLists,
        setPickLists,
        fetchPickListById,
        pickListDetail,
        setPickListDetail,
        loadingDetail,
        setLoadingDetail,
        salesOrders,
        setSalesOrders,
        fetchSalesOrdersByPickListId,
        details,
        setDetails,
        totalDetail,
        setTotalDetail,
        fetchPickListDetails,
        currentProcessPickList,
        setCurrentProcessPickList,
        updatePickingStatus,
        updatePickedItems,
        updatePrintStatus,
        toggleSelectAll,
        selectedIds,
        setSelectedIds,
        setSalesOrderIds,
        isSelectAll,
        isSelected,
        setIsSelectAll,
        salesOrderIds,
        splitPickList,
        date,
        setDate,
      }}
    >
      {children}
    </PickListContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePickList = () => {
  const pickListContext = React.useContext(PickListContext)

  if (!pickListContext) {
    throw new Error('usePickList has to be used within <PickListContext>')
  }

  return pickListContext
}
