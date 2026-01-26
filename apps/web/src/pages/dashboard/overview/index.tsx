import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { Clock } from '@/components/clock'
import { Tabs } from '@/components/ui/tabs'
import DashboardProvider from './context/dashboard-context'
import SalesOrderCard from './components/sales-orders-card'

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <Layout>
        <Layout.Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Clock />
            <ThemeSwitch />
            <UserNav />
          </div>
        </Layout.Header>
        <Layout.Body>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          </div>
          <Tabs
            orientation='vertical'
            defaultValue='overview'
            className='space-y-4'
          >
            <SalesOrderCard />
          </Tabs>
        </Layout.Body>
      </Layout>
    </DashboardProvider>
  )
}
