import cron from 'node-cron'
import { syncOrderService } from '@/services/index.js'

export const initCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running Sync Orders Job...')
    await syncOrderService()
  })
}