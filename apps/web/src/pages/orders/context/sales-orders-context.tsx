import React, { useEffect, useRef, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import api from '@/lib/api'
import { SalesOrderItem } from '@/types'
import { format } from 'date-fns'
import { subscribeWS, unsubscribeWS } from '@/lib/ws'

type DialogType = 'invite' | 'add' | 'edit' | 'delete'
type PickListForm = {
  picker?: string
  pickList?: string
  code: string
  notes: string
  status?: string
  area?: string
}

type PickList = { value: string; label: string; notes: string }

interface FetchSalesOrdersParams {
  master: boolean
  page: number
  per_page: number
  search?: string
  sortBy?: string
  sortDesc?: boolean
  due_date?: string
  [key: string]: string | number | boolean | undefined
}

interface Area {
  TrnspCode: string
  TrnspName: string
}

interface PickListWithArea {
  id: number
  code: string
  notes: string | null
  area: string | null
}

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
  salesOrders: SalesOrderItem[]
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
  customer: { value: string; label: string }[]
  setCustomer: React.Dispatch<
    React.SetStateAction<{ value: string; label: string }[]>
  >
  dueDate?: Date
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  orderIds: { value: string; label: string }[]
  setOrderIds: React.Dispatch<
    React.SetStateAction<{ value: string; label: string }[]>
  >
  pickers: { value: string; label: string }[]
  setPickers: React.Dispatch<
    React.SetStateAction<{ value: string; label: string }[]>
  >
  fetchPickers: () => void
  createPickList: () => Promise<void>
  modalOpen: boolean
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  pickLists: PickList[]
  setPickLists: React.Dispatch<React.SetStateAction<PickList[]>>
  pickListForm: PickListForm

  setPickListForm: React.Dispatch<React.SetStateAction<PickListForm>>
  isLoadingPickList: boolean
  setIsLoadingPickList: React.Dispatch<React.SetStateAction<boolean>>
  totalSalesOrder: number
  setTotalSalesOrder: React.Dispatch<React.SetStateAction<number>>
  totalItems: number
  setTotalItems: React.Dispatch<React.SetStateAction<number>>
  toggleSelectAll: (checked: boolean) => void
  isSelectAll: boolean
  isSelected: (id: string) => boolean
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  salesOrderIds: string[]
  setSalesOrderIds: React.Dispatch<React.SetStateAction<string[]>>
  rawOrders: SalesOrderItem[]
  setRawOrders: React.Dispatch<React.SetStateAction<SalesOrderItem[]>>
  selectedOrders: SalesOrderItem[]
  setSelectedOrders: React.Dispatch<React.SetStateAction<SalesOrderItem[]>>
  isProcessing: boolean
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
  exportDate?: Date
  setExportDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  exportData: SalesOrderItem[]
  setExportData: React.Dispatch<React.SetStateAction<SalesOrderItem[]>>
  isLoadingExport: boolean
  setIsLoadingExport: React.Dispatch<React.SetStateAction<boolean>>
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
    pageSize: 50,
  })
  const [total, setTotal] = useState(0)
  const [salesOrders, setSalesOrders] = useState<SalesOrderItem[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [sortOptions, setSortOptions] = useState<SortingState>([])
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [area, setArea] = useState<{ value: string; label: string }[]>([])
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [customer, setCustomer] = useState<{ value: string; label: string }[]>(
    []
  )
  const [orderIds, setOrderIds] = useState<{ value: string; label: string }[]>(
    []
  )
  const [pickers, setPickers] = useState<{ value: string; label: string }[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [pickLists, setPickLists] = useState<PickList[]>([])
  const [pickListForm, setPickListForm] = useState<PickListForm>({
    picker: '',
    pickList: '',
    code: '',
    notes: '',
    area: '',
  })
  const [isLoadingPickList, setIsLoadingPickList] = useState(false)
  const [totalSalesOrder, setTotalSalesOrder] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(true)
  const [salesOrderIds, setSalesOrderIds] = useState<string[]>([])
  const [rawOrders, setRawOrders] = useState<SalesOrderItem[]>([])
  const [selectedOrders, setSelectedOrders] = useState<SalesOrderItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [exportDate, setExportDate] = useState<Date | undefined>(undefined)
  const [exportData, setExportData] = useState<SalesOrderItem[]>([])
  const [isLoadingExport, setIsLoadingExport] = useState(false)

  const filterRefs = useRef(filters)

  useEffect(() => {
    filterRefs.current = filters
  }, [filters])

  useEffect(() => {
    const allSelected =
      salesOrderIds.length > 0 && selectedIds.length === salesOrderIds.length
    setIsSelectAll(allSelected)
  }, [salesOrderIds, selectedIds])

  useEffect(() => {
    const filteredSalesOrders = rawOrders.filter((order) =>
      selectedIds.includes(String(order.DocNum))
    )

    setSelectedOrders(filteredSalesOrders)
  }, [selectedIds, rawOrders])

  useEffect(() => {
    if (!isProcessing) {
      subscribeWS<SalesOrderItem | SalesOrderItem[]>({
        event: 'order:new',
        callback: (incoming) => {
          if (filterRefs.current.length === 0) {
            const newOrders = Array.isArray(incoming) ? incoming : [incoming]

            // 1. Tambahkan ke rawOrders, urut berdasarkan DocNum descending
            setRawOrders((prev) => {
              const merged = [...prev, ...newOrders]
              // Optional: urut descending agar DocNum paling tinggi di atas
              merged.sort((a, b) => b.DocNum - a.DocNum)
              return merged
            })

            // 2. Update salesOrders unik per DocNum, urut descending
            setSalesOrders((prev) => {
              const allOrders = [...prev, ...newOrders]
              const uniqueOrdersMap = new Map<number, SalesOrderItem>()
              allOrders.forEach((o) => uniqueOrdersMap.set(o.DocNum, o))
              const uniqueOrders = Array.from(uniqueOrdersMap.values())
              uniqueOrders.sort((a, b) => b.DocNum - a.DocNum)
              return uniqueOrders
            })

            // 3 & 4. Update salesOrderIds & selectedIds unik sekaligus
            const newIds = newOrders.map((order) => String(order.DocNum))

            setSalesOrderIds((prev) => {
              const merged = [...prev, ...newIds]
              return Array.from(new Set(merged)).sort(
                (a, b) => Number(b) - Number(a)
              )
            })
            setSelectedIds((prev) => {
              const merged = [...prev, ...newIds]
              return Array.from(new Set(merged)).sort(
                (a, b) => Number(b) - Number(a)
              )
            })

            // 5. Hitung total sales order unik baru
            setTotal((prevTotal) => {
              const existingIds = new Set(salesOrderIds)
              const newCount = newOrders
                .map((o) => o.DocNum)
                .filter((id) => !existingIds.has(String(id))).length
              return prevTotal + newCount
            })

            setIsSelectAll(true)

            console.log('Order created:', newOrders)
          }
        },
      })

      return () => unsubscribeWS('order:new')
    }
  }, [isProcessing])

  useEffect(() => {
    subscribeWS<SalesOrderItem | SalesOrderItem[]>({
      event: 'order:closed',
      callback: (incoming) => {
        const closedOrders = Array.isArray(incoming) ? incoming : [incoming]

        const closedIds = new Set(
          closedOrders.map((order) => String(order.DocNum))
        )

        // 1. Hapus dari rawOrders
        setRawOrders((prev) =>
          prev.filter((order) => !closedIds.has(String(order.DocNum)))
        )

        // 2. Hapus dari salesOrders
        setSalesOrders((prev) =>
          prev.filter((order) => !closedIds.has(String(order.DocNum)))
        )

        // 3. Hapus dari salesOrderIds
        setSalesOrderIds((prev) => {
          const remainingIds = prev.filter((id) => !closedIds.has(id))

          setIsSelectAll(remainingIds.length > 0)

          return remainingIds
        })

        // 4. Hapus dari selectedIds
        setSelectedIds((prev) => prev.filter((id) => !closedIds.has(id)))

        // 5. Update total
        setTotal((prevTotal) => Math.max(0, prevTotal - closedOrders.length))
      },
    })

    return () => unsubscribeWS('order:closed')
  }, [])

  useEffect(() => {
    if (isSelectAll) {
      if (isSelectAll) {
        setSelectedIds(salesOrderIds)
      }
    }
  }, [salesOrders, isSelectAll])

  useEffect(() => {
    if (selectedIds) {
      const filteredSalesOrders = rawOrders.filter((so) =>
        selectedIds.includes(String(so.DocNum))
      )
      setSelectedOrders(filteredSalesOrders)
    }
  }, [selectedIds])

  const isSelected: (id: string) => boolean = (id) => selectedIds.includes(id)

  const toggleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedIds(salesOrderIds)
    } else {
      setSelectedIds([])
    }
  }

  // API request
  const fetchSalesOrders = async (loadMaster: boolean = false) => {
    setIsLoading(true)
    setIsProcessing(true)

    const params: FetchSalesOrdersParams = {
      master: loadMaster,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }

    if (search) {
      params.search = search
    }

    if (filters.length > 0) {
      for (const filter of filters) {
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          params[filter.id] = filter.value.join(',')
        }
      }
    }

    if (sortOptions.length > 0) {
      const sort = sortOptions[0]
      params.sortBy = sort.id
      params.sortDesc = sort.desc
    }

    if (dueDate) {
      params.due_date = format(dueDate, 'yyyy-MM-dd')
    }

    try {
      const res = await api.get('/orders', { params })
      const { data } = res

      const newRawOrders = data.data?.rawOrders ?? []
      setRawOrders(newRawOrders)

      const newOrders = data.data?.orders?.data ?? []

      setSalesOrders((prev) => {
        const isFirstPage = pagination.pageIndex === 0

        if (isFirstPage) {
          return [...newOrders]
        }

        const merged = [...prev, ...newOrders]
        const unique = new Map(merged.map((item) => [item.DocNum, item]))

        return [...unique.values()]
      })

      setTotal(data.data?.orders?.total ?? 0)
      setTotalItems(data.data?.totalItems ?? 0)
      setTotalSalesOrder(data.data?.totalSo ?? 0)

      const ids = (data.data?.salesOrderIds ?? []).map((id: number | string) =>
        String(id)
      )

      setSalesOrderIds(ids)
      setIsSelectAll(true)
      setSelectedIds(ids)
    } catch (error) {
      console.error('Failed to fetch sales orders:', error)
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const fetchArea = async () => {
    try {
      const res = await api.get('/area')
      const { data } = res
      const areas = data.data || []
      const areaOptions = areas.map((area: Area) => ({
        value: area.TrnspCode,
        label: area.TrnspName,
      }))
      setArea(areaOptions)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    }
  }

  const fetchPickList = async () => {
    try {
      setIsLoadingPickList(true)
      const res = await api.get('/picklist')
      const { data } = res
      const pickLists = data.data || []

      const options = pickLists.map((pickList: PickListWithArea) => ({
        value: pickList.id,
        label: pickList.code,
        notes: pickList.notes,
        area: pickList.area,
      }))
      setPickLists(options)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    } finally {
      setIsLoadingPickList(false)
    }
  }

  const fetchCustomer = async () => {
    try {
      const res = await api.get('/customer')
      const { data } = res
      const customers = data.data || []
      const options = customers.map(
        (customer: { CardCode: string; CardName: string }) => ({
          value: customer.CardCode,
          label: customer.CardName,
        })
      )
      setCustomer(options)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    }
  }

  const fetchOrderIds = async () => {
    try {
      const res = await api.get('orders/orderIds')
      const { data } = res
      const orderIds = data.data || []
      const options = orderIds.map((orderId: { DocNum: number }) => ({
        value: orderId.DocNum,
        label: orderId.DocNum,
      }))
      setOrderIds(options)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    }
  }

  const fetchPickers = async () => {
    try {
      const res = await api.get('/user/pickers')

      const { data } = res
      const pickers = data.data || []
      const options = pickers.map((picker: { id: number; name: string }) => ({
        value: picker.id,
        label: picker.name,
      }))
      setPickers(options)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    }
  }

  const createPickList = async () => {
    try {
      setIsLoadingPickList(true)

      const params: Record<string, string | string[] | undefined> = {}

      if (filters.length > 0) {
        filters.forEach((f) => {
          if (Array.isArray(f.value) && f.value.length > 0) {
            params[f.id] = f.value.length > 1 ? f.value.join(',') : f.value[0]
          }
        })
      }

      if (dueDate) {
        params.dueDate = format(dueDate, 'yyyy-MM-dd')
      }

      if (pickListForm.pickList) {
        params.pickList = pickListForm.pickList
      } else {
        params.picker = pickListForm.picker
        params.notes = pickListForm.notes
        params.area = pickListForm.area
      }

      params.selectedIds = selectedIds

      const res = await api.post('/picklist', params, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.status !== 200 || res.data?.data?.status !== 'ok') {
        throw new Error(res.data?.message || 'Gagal membuat pick list')
      }
    } catch (error: unknown) {
      console.error('Gagal membuat pick list:', error)
    } finally {
      setIsLoadingPickList(false)
      setModalOpen(false)
    }
  }

  useEffect(() => {
    fetchArea()
    fetchCustomer()
    fetchOrderIds()
    fetchPickers()
    fetchPickList()
  }, [])

  useEffect(() => {
    fetchSalesOrders()
  }, [pagination, debouncedSearch, filters, sortOptions, dueDate])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  const fetchExportSalesOrders = async () => {
    try {
      setIsLoadingExport(true)
      const date = exportDate ? format(exportDate, 'yyyy-MM-dd') : null
      const res = await api.post('/orders/export', { date })
      const { data } = res
      const orders = data.data || []
      setExportData(orders)
    } catch (error) {
      console.error('Failed to fetch sales persons:', error)
    } finally {
      setIsLoadingExport(false)
    }
  }

  useEffect(() => {
    if (exportDate) {
      fetchExportSalesOrders()
    }
  }, [exportDate])

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
        dueDate,
        setDueDate,
        customer,
        setCustomer,
        orderIds,
        setOrderIds,
        pickers,
        setPickers,
        fetchPickers,
        createPickList,
        modalOpen,
        setModalOpen,
        pickLists,
        setPickLists,
        pickListForm,
        setPickListForm,
        isLoadingPickList,
        setIsLoadingPickList,
        totalSalesOrder,
        setTotalSalesOrder,
        totalItems,
        setTotalItems,
        toggleSelectAll,
        isSelectAll,
        isSelected,
        selectedIds,
        setSelectedIds,
        salesOrderIds,
        setSalesOrderIds,
        rawOrders,
        setRawOrders,
        selectedOrders,
        setSelectedOrders,
        isProcessing,
        setIsProcessing,
        exportDate,
        setExportDate,
        exportData,
        setExportData,
        isLoadingExport,
        setIsLoadingExport,
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
