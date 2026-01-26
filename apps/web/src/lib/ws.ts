import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

interface WSOptions<T = any> {
  event: string
  callback: (data: T) => void
}

const initSocket = () => {
  if (!socket) {
    const ioUrl = import.meta.env.VITE_SOCKET_IO_URL
    socket = io(ioUrl, {
      path: '/ws/socket.io', // path sesuai server
      transports: ['websocket'],
    })

    socket.on('connect', () => console.log('✅ Connected', socket?.id))
    socket.on('disconnect', () => console.log('⚠️ Disconnected'))
    socket.on('connect_error', (err) =>
      console.error('❌ Connection error', err)
    )
  }
  return socket
}

// subscribe ke event
export const subscribeWS = <T = any>({ event, callback }: WSOptions<T>) => {
  const s = initSocket()
  s.on(event, callback)
}

// unsubscribe event
export const unsubscribeWS = (event: string) => {
  if (socket) socket.off(event)
}
