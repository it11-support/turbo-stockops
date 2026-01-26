import api from '@/lib/api'

export const fetchUsers = async () => {
  const { data } = await api.get('/user')
  return data
}
