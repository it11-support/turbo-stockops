import { useAuthStore } from '@/stores/authStore'
import {
  IconChecklist,
  IconHome,
  IconListDetails,
  IconShoppingCart,
} from '@tabler/icons-react'
import { User2Icon } from 'lucide-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
  hidden?: boolean
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const getSideLinks = () => {
  const authStore = useAuthStore()
  const role = authStore.user?.role.role

  const sidelinks: SideLink[] = [
    {
      title: 'Home',
      label: '',
      href: '/',
      icon: <IconHome size={18} />,
    },
    // {
    //   title: 'Dashboard',
    //   label: '',
    //   href: '/dashboard',
    //   icon: <IconLayoutDashboard size={18} />,
    // },
    // {
    //   title: 'KanBan',
    //   label: '',
    //   href: '/kanban',
    //   icon: <IconLayoutKanban size={18} />,
    // },
    // {
    //   title: 'Chats',
    //   label: '',
    //   href: '/chats',
    //   icon: <IconMessages size={18} />,
    // },
    {
      title: 'Orders',
      label: '',
      href: '/order',
      icon: <IconShoppingCart size={18} />,
      hidden: role === 'picker',
    },
    // {
    //   title: 'Calendar',
    //   label: '',
    //   href: '/calendar',
    //   icon: <IconCalendarWeek size={18} />,
    // },
    // {
    //   title: 'Email',
    //   label: '',
    //   href: '/emails',
    //   icon: <IconShoppingCart size={18} />,
    //   sub: [
    //     {
    //       title: 'Email',
    //       label: '',
    //       href: '/emails',
    //       icon: <IconBrandProducthunt size={18} />,
    //     },
    //     {
    //       title: 'Send Email',
    //       label: '',
    //       href: '/emails/send',
    //       icon: <IconHexagonNumber1 size={18} />,
    //     },
    //   ],
    // },
    {
      title: 'Picking',
      label: '',
      href: '',
      icon: <IconListDetails size={18} />,
      sub: [
        {
          title: 'Pick Lists',
          label: '',
          href: '/pick-list',
          icon: <IconChecklist size={18} />,
        },
        // {
        //   title: 'Confirm Picking',
        //   label: '',
        //   href: '/pick-list/confirm',
        //   icon: <IconCheckupList size={18} />,
        // },
      ],
    },
    // {
    //   title: 'Supports',
    //   label: '',
    //   href: '/supports',
    //   icon: <IconHelpHexagon size={18} />,
    // },
    // {
    //   title: 'Authentication',
    //   label: '',
    //   href: '',
    //   icon: <IconUserShield size={18} />,
    //   sub: [
    //     {
    //       title: 'Sign In (email + password)',
    //       label: '',
    //       href: '/sign-in',
    //       icon: <IconHexagonNumber1 size={18} />,
    //     },
    //     {
    //       title: 'Sign In (Box)',
    //       label: '',
    //       href: '/login',
    //       icon: <IconHexagonNumber2 size={18} />,
    //     },
    //     {
    //       title: 'Sign Up',
    //       label: '',
    //       href: '/sign-up',
    //       icon: <IconHexagonNumber3 size={18} />,
    //     },
    //     {
    //       title: 'Forgot Password',
    //       label: '',
    //       href: '/forgot-password',
    //       icon: <IconHexagonNumber4 size={18} />,
    //     },
    //     {
    //       title: 'OTP',
    //       label: '',
    //       href: '/otp',
    //       icon: <IconHexagonNumber5 size={18} />,
    //     },
    //   ],
    // },
    {
      title: 'Users',
      label: '',
      href: '/users',
      icon: <User2Icon size={18} />,
    },
    // {
    //   title: 'Settings',
    //   label: '',
    //   href: '/settings',
    //   icon: <IconSettings size={18} />,
    // },
  ]
  return sidelinks.filter((link) => !link.hidden)
}
