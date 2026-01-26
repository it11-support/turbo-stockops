import { Role } from '../role'

export interface User {
  auth_type: string
  email: string
  id: number
  name: string
  username: string
  role: Role
  token: string
}
