import { IconShield, IconUsersGroup, IconUserShield } from '@tabler/icons-react'

export const userTypes = [
  {
    label: 'Superadmin',
    value: 1,
    icon: IconShield,
  },
  {
    label: 'Admin',
    value: 2,
    icon: IconUserShield,
  },
  {
    label: 'Picker',
    value: 3,
    icon: IconUsersGroup,
  },
] as const
