import { secureRandomElement, secureRandomDate, secureUUID, secureRandomInt } from '@/lib/secure-random.js'

type User = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  role: 'superadmin' | 'admin' | 'cashier' | 'manager'
  createdAt: string
  updatedAt: string
}

const firstNames = [
  'John',
  'Jane',
  'Alice',
  'Bob',
  'Chris',
  'Diana',
  'Emma',
  'Frank',
  'Grace',
  'Henry',
]
const lastNames = [
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
const statuses: User['status'][] = [
  'active',
  'inactive',
  'invited',
  'suspended',
]
const roles: User['role'][] = ['superadmin', 'admin', 'cashier', 'manager']

export const users: User[] = Array.from({ length: 20 }, (): User => {
  const firstName = secureRandomElement(firstNames)
  const lastName = secureRandomElement(lastNames)
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${secureRandomInt(0, 99)}`
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

  return {
    id: secureUUID(),
    firstName,
    lastName,
    username,
    email,
    phoneNumber: `+1-${secureRandomInt(1000000000, 1999999999)}`,
    status: secureRandomElement(statuses),
    role: secureRandomElement(roles),
    createdAt: secureRandomDate(new Date(2020, 0, 1), new Date()),
    updatedAt: secureRandomDate(new Date(2023, 0, 1), new Date()),
  }
})