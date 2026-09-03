import React, { useEffect, useState } from 'react'
import { User, UserForm } from '../data/schema'
import useDialogState from '@/hooks/use-dialog-state'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import api from '@/lib/api'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersQueryParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  [key: string]: string | number | undefined
}

interface UsersContextType {
  search: string
  setSearch: (value: string) => void
  fetchUsers: () => void
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]
  total: number
  isLoading: boolean
  filters: ColumnFiltersState
  setFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  sortOptions: SortingState
  setSortOptions: React.Dispatch<React.SetStateAction<SortingState>>
  updateUser: (id: string, user: UserForm) => Promise<void>
  createUser: (user: UserForm) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [sortOptions, setSortOptions] = useState<SortingState>([])
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // API request
  // Update User
  const updateUser = async (id: string, user: UserForm) => {
    try {
      setIsLoading(true)
      await api.put(`/user/${id}`, user)
      await fetchUsers()
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    try {
      setIsLoading(true)
      await api.delete(`/user/${id}`)
      await fetchUsers()
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (user: UserForm) => {
    try {
      setIsLoading(true)
      await api.post('/user/register', user)
      await fetchUsers()
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    const params: UsersQueryParams = {
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }

    if (search) {
      params['search'] = search
    }

    if (filters.length > 0) {
      filters.forEach((f) => {
        const value = f.value as unknown
        if (Array.isArray(value)) {
          const arr = value as string[]
          params[f.id] = arr.length > 1 ? arr.join(',') : arr[0]
        }
      })
    }

    const descSorts = sortOptions.filter((s) => s.desc)

    if (descSorts.length > 0) {
      params['sort'] = descSorts.map((s) => s.id).join(',')
    }

    const res = await api.get('/user', { params })

    const { data } = res
    setUsers(data.data.data)
    setTotal(data.data.total)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setIsLoading(true)
      await fetchUsers()

      if (!cancelled) setIsLoading(false)
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, pagination, filters, sortOptions])

  return (
    <UsersContext.Provider
      value={{
        pagination,
        setPagination,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        users,
        total,
        search,
        setSearch,
        fetchUsers,
        isLoading,
        filters,
        setFilters,
        sortOptions,
        setSortOptions,
        updateUser,
        createUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
