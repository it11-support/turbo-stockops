import { columns } from './components/sales-order-columns'
import { SalesOrderPrimaryButtons } from './components/sales-order-primary-buttons'
import { SalesOrderTable } from './components/sales-order-table'
import { UserNav } from '@/components/user-nav'
import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import SalesOrderProvider from './context/sales-orders-context'

export default function Users() {
  return (
    <SalesOrderProvider>
      <Layout fixed>
        <Layout.Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <UserNav />
          </div>
        </Layout.Header>
        <Layout.Body className='flex flex-col'>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Sales Order</h2>
            </div>
            <SalesOrderPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <SalesOrderTable columns={columns} />
          </div>
        </Layout.Body>
      </Layout>
    </SalesOrderProvider>
  )
}
