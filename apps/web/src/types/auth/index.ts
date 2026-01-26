import { User } from '../user'
import { Role } from '../role'

export interface AuthState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export interface AuthContextType {
  token: string | null
  role: string | null
  permissions: string[]
  login: (token: string, role: Role, perms: string[]) => void
  logout: () => void
  isAuthenticated: boolean
}
