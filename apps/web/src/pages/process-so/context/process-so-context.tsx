import api from '@/lib/api'
import { SoItemMap } from '@/types'
import React from 'react'

interface ProcessOrderContextType {
  processOrder: SoItemMap
  setProcessOrder: React.Dispatch<React.SetStateAction<SoItemMap>>
  fetchProcessOrder: (id: number) => Promise<void>
  confirmSo: (
    id: string | undefined,
    data: { id: number; value: number }[]
  ) => Promise<void>
}

const ProcessSoContext = React.createContext<ProcessOrderContextType | null>(
  null
)

interface Props {
  children: React.ReactNode
}

export default function ProcessSoProvider({ children }: Props) {
  const [processOrder, setProcessOrder] = React.useState<SoItemMap>({})

  const fetchProcessOrder = async (id: number) => {
    try {
      const response = await api.get(`/orders/${id}/so-items`)
      const { data } = response
      setProcessOrder(data.data)
    } catch (error) {
      console.error('Failed to fetch sales person:', error)
    }
  }

  // Confirm SO
  const confirmSo = async (
    id: string | undefined,
    data: { id: number; value: number }[]
  ) => {
    try {
      await api.post(`/picklist/${id}/confirm-so`, { data })
    } catch (error) {
      console.error('Failed to fetch sales person:', error)
    }
  }

  return (
    <ProcessSoContext.Provider
      value={{ processOrder, setProcessOrder, fetchProcessOrder, confirmSo }}
    >
      {children}
    </ProcessSoContext.Provider>
  )
}

export const useProcessSo = () => {
  const context = React.useContext(ProcessSoContext)
  if (!context) {
    throw new Error('useProcessSo must be used within a ProcessSoProvider')
  }
  return context
}
