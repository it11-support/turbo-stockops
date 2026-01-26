import { useSalesOrder } from '../context/sales-orders-context'
import { Button } from '@/components/custom/button'
import { RefreshCw } from 'lucide-react'

export function SalesOrderPrimaryButtons() {
  const { fetchSalesOrders, isLoading } = useSalesOrder()
  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        disabled={isLoading}
        onClick={() => fetchSalesOrders(true)}
      >
        <span>Load Data</span>
        {isLoading ? (
          <RefreshCw className='h-3.5 w-3.5 animate-spin' />
        ) : (
          <RefreshCw className='h-3.5 w-3.5' />
        )}
      </Button>
    </div>
  )
}
