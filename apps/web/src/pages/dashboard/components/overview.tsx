import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { secureRandomInt } from '@/lib/secure-random.js'

const data = [
  {
    name: 'Jan',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Feb',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Mar',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Apr',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'May',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Jun',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Jul',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Aug',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Sep',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Oct',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Nov',
    total: secureRandomInt(1000, 6000),
  },
  {
    name: 'Dec',
    total: secureRandomInt(1000, 6000),
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
