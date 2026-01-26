export interface Permission {
  id: number
  name: string
  description: string
}
export interface Role {
  role: 'superadmin' | 'admin' | 'picker' | null
  permissions: Permission[]
}
