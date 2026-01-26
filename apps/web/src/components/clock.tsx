import { useEffect, useState } from 'react'

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`
  const formattedSecond = `${seconds.toString().padStart(2, '0')}`

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className='flex flex-col items-start font-mono'>
      <div className='flex items-end space-x-1 sm:items-start md:mt-5'>
        <span className='text-3xl font-semibold md:text-5xl'>
          {formattedTime}
        </span>
        <span className='mb-1 text-sm font-semibold text-gray-500'>
          {formattedSecond}
        </span>
      </div>
      <span className='hidden text-sm font-semibold text-gray-700 md:block'>
        {formattedDate}
      </span>
    </div>
  )
}
