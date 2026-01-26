import api from '@/lib/api'

export const login = async ({
  username,
  password,
}: {
  username: string
  password: string
}) => {
  const { data } = await api.post('/user/login', { username, password })
  return data
}
