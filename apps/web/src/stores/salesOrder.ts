import api from '@/lib/api'
import { SalesOrderItem } from '@/types'
import { format } from 'date-fns'
import { create } from 'zustand'

type Filters = {
  page: number
  perPage: number
  area: string
  search: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  startDate?: Date // ISO string
  endDate?: Date // ISO string
}

type Pagination = {
  total: number
  lastPage: number
}

type SalesOrderStore = {
  salesOrders: SalesOrderItem[]
  filters: Filters
  pagination: Pagination
  loading: boolean

  setFilters: (filters: Partial<Filters>) => void
  fetchSalesOrders: (masterSalesOrder?: boolean) => Promise<void>
}

export const useSalesOrderStore = create<SalesOrderStore>((set, get) => ({
  salesOrders: [],
  filters: {
    page: 1,
    perPage: 10,
    area: '',
    search: '',
    sortBy: 'DocDate',
    sortDirection: 'desc',
    startDate: undefined,
    endDate: undefined,
  },
  pagination: {
    total: 0,
    lastPage: 1,
  },
  loading: false,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }))
    get().fetchSalesOrders()
  },

  fetchSalesOrders: async (masterSalesOrder = false) => {
    set({ loading: true })
    let url = '/orders'
    if (!masterSalesOrder) {
      const {
        page,
        perPage,
        area,
        search,
        sortBy,
        sortDirection,
        startDate,
        endDate,
      } = get().filters
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        search,
        area,
        sort_by: sortBy,
        sort_direction: sortDirection,
      })
      if (startDate)
        params.append('start_date', format(startDate, 'yyyy-MM-dd'))
      if (endDate) params.append('end_date', format(endDate, 'yyyy-MM-dd'))

      url = `/orders?${params.toString()}`
    }
    try {
      const { data } = await api.get(url)
      set({ salesOrders: data.data })
    } catch (err) {
      console.error('Error fetching sales orders:', err)
    } finally {
      set({ loading: false })
    }
  },
}))
