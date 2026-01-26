import { IconShield, IconUsersGroup, IconUserShield } from '@tabler/icons-react'

export const userTypes = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: IconShield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Picker',
    value: 'picker',
    icon: IconUsersGroup,
  },
] as const
