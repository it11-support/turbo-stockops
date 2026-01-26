import { UserNav } from '@/components/user-nav'
import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import PickListProvider from '../context/pick-list-context'
import { Clock } from '@/components/clock'
import ProcessPicking from './components/process'

export default function PickListProcess() {
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
            <div className='flex items-center space-x-2'>
              <h2 className='text-2xl font-bold tracking-tight'>
                Process Pick List
              </h2>
            </div>
            <div className='flex gap-2'>
              {/* <SalesOrderPrimaryButtons /> */}
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {/* <PickListDetailTable columns={columns} /> */}
            <ProcessPicking />
          </div>
        </Layout.Body>
      </Layout>
    </PickListProvider>
  )
}
