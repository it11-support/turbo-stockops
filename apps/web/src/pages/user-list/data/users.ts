type User = {
  id: string
  name: string
  username: string
  email: string
  role: 'superadmin' | 'admin' | 'picker'
  createdAt: string
  updatedAt: string
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
  return date.toISOString()
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
  const lastName = getRandomElement(names)
  const username = `${lastName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
  const email = `${lastName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

  return {
    id: generateUUID(),
    name: lastName,
    username,
    email,
    role: getRandomElement(roles),
    createdAt: generateRandomDate(new Date(2020, 0, 1), new Date()),
    updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
  }
})
