import api from '@/lib/api'
import { User } from '@/types'
import { create } from 'zustand'

type Filters = {
  page: number
  perPage: number
  search: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

type Pagination = {
  total: number
  lastPage: number
}

type UserStore = {
  users: User[]
  filters: Filters
  pagination: Pagination
  loading: boolean

  setFilters: (filters: Partial<Filters>) => void
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  filters: {
    page: 1,
    perPage: 10,
    search: '',
    sortBy: 'username',
    sortDirection: 'asc',
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
    get().fetchUsers()
  },

  fetchUsers: async () => {
    set({ loading: true })
    const { page, perPage, search, sortBy, sortDirection } = get().filters
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      search,
      sort_by: sortBy,
      sort_direction: sortDirection,
    })

    try {
      const { data } = await api.get(`/user?${params.toString()}`)
      set({
        users: data.data,
        pagination: {
          total: data.total,
          lastPage: data.last_page,
        },
      })
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      set({ loading: false })
    }
  },
}))
