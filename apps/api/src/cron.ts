import cron from 'node-cron'
import { syncOrderService } from '@/services/index.js'

export const initCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running Sync Orders Job...')
    try {
      await syncOrderService()
    } catch (error) {
      console.error('Sync Orders Job failed:', error)
    }
  })
}