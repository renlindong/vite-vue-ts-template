import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

interface Options {
  socketUrl: string,
  on?: {
    [key: string]: (data: any) => unknown
  }
}

export default function useSocket({
  socketUrl,
  on = {}
}: Options) {
  const socket = ref(io(socketUrl))

  Object.keys(on).forEach(eventName => {
    const cb = on[eventName]
    socket.value.on(eventName, cb)
  })

  onMounted(() => {

  })

  onUnmounted(() => {
    socket.value.disconnect()
  })

  return socket.value
}

