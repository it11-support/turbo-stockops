import { secureRandomElement, secureRandomInt, secureRandomDate, secureUUID } from '@/lib/secure-random.js'

type User = {
  id: string
  name: string
  username: string
  email: string
  role: 'superadmin' | 'admin' | 'picker'
  createdAt: string
  updatedAt: string
}

const names = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Martinez',
  'Lee',
]
const roles: User['role'][] = ['superadmin', 'admin', 'picker']

export const users: User[] = Array.from({ length: 20 }, (): User => {
  const lastName = secureRandomElement(names)
  const username = `${lastName.toLowerCase()}.${lastName.toLowerCase()}${secureRandomInt(0, 99)}`
  const email = `${lastName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

  return {
    id: secureUUID(),
    name: lastName,
    username,
    email,
    role: secureRandomElement(roles),
    createdAt: secureRandomDate(new Date(2020, 0, 1), new Date()),
    updatedAt: secureRandomDate(new Date(2023, 0, 1), new Date()),
  }
})