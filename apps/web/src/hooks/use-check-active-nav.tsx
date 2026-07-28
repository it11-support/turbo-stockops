import { useLocation } from 'react-router'

export default function useCheckActiveNav() {
  const { pathname } = useLocation()

  const checkActiveNav = (nav: string) => {
    return pathname === nav
  }

  return { checkActiveNav }
}
