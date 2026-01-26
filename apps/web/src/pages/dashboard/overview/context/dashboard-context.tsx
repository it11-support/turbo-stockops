import api from '@/lib/api'
import React, { useEffect } from 'react'

interface ActiveOrders {
  totalOrders: number
  processedOrders: number
  totalItems: number
  processedItems: number
  totalPickLists: number
}
interface DashboardContextType {
  activeOrders: ActiveOrders
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrders>>
  fetchActiveOrders: () => Promise<void>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const DashboardContext = React.createContext<DashboardContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function DashboardProvider({ children }: Props) {
  const [activeOrders, setActiveOrders] = React.useState<ActiveOrders>({
    totalOrders: 0,
    totalItems: 0,
    totalPickLists: 0,
    processedOrders: 0,
    processedItems: 0,
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const fetchActiveOrders = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/orders/active`)
      const { data } = response
      setActiveOrders(data.data)
    } catch (error) {
      console.error('Failed to fetch sales person:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveOrders()
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        activeOrders,
        setActiveOrders,
        fetchActiveOrders,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const dashboardContext = React.useContext(DashboardContext)

  if (!dashboardContext) {
    throw new Error('useDashboard has to be used within <DashboardContext>')
  }

  return dashboardContext
}
