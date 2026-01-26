import { UserNav } from '@/components/user-nav'
import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { Clock } from '@/components/clock'
import ProcessSoContext from './context/process-so-context'
import ProcessOrder from './components/processorder'

export default function SalesOrders() {
  return (
    <ProcessSoContext>
      <Layout fixed>
        <Layout.Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Clock />
            <ThemeSwitch />
            <UserNav />
          </div>
        </Layout.Header>
        <Layout.Body className='flex flex-col'>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Process Sales Orders
              </h2>
            </div>
            <div className='flex gap-2'>
              {/* <SalesOrderPrimaryButtons /> */}
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {/* <SalesOrderTable columns={columns} /> */}
            <ProcessOrder />
          </div>
        </Layout.Body>
      </Layout>
    </ProcessSoContext>
  )
}
