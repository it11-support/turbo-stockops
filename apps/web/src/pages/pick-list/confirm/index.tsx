import { UserNav } from '@/components/user-nav'
import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { Clock } from '@/components/clock'
import { PickListTable } from './components/table'
import PickListProvider from '../context/pick-list-context'
import { columns } from './components/columns'

export default function PickList() {
  return (
    <PickListProvider>
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
                Confirm Pick Lists
              </h2>
            </div>
            <div className='flex gap-2'>
              {/* <SalesOrderPrimaryButtons /> */}
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <PickListTable columns={columns} />
          </div>
        </Layout.Body>
      </Layout>
    </PickListProvider>
  )
}
