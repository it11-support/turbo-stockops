import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '../context/dashboard-context'
import {
  IconListCheck,
  IconListLetters,
  IconShoppingCart,
} from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

const SalesOrderCard = () => {
  const { activeOrders, isLoading } = useDashboard()

  return isLoading ? (
    <div className='flex h-40 items-center justify-center'>
      <Loader2 className='animate-spin' />
    </div>
  ) : (
    <>
      <TabsContent value='overview' className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card
            onClick={() => (window.location.href = '/order')}
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Orders
              </CardTitle>
              <IconShoppingCart size={20} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {activeOrders.totalOrders}
              </div>
              {activeOrders.processedOrders > 0 && (
                <p className='text-xs text-muted-foreground'>
                  +{activeOrders.processedOrders} processed orders
                </p>
              )}
            </CardContent>
          </Card>
          <Card
            onClick={() => (window.location.href = '/order')}
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Items</CardTitle>
              <IconListCheck size={20} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {activeOrders.totalItems}
              </div>
              {activeOrders.processedItems > 0 && (
                <p className='text-xs text-muted-foreground'>
                  +{activeOrders.processedItems} processed items
                </p>
              )}
            </CardContent>
          </Card>
          <Card
            onClick={() => (window.location.href = '/pick-list')}
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pick List</CardTitle>
              <IconListLetters size={20} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {activeOrders.totalPickLists}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  )
}

export default SalesOrderCard
