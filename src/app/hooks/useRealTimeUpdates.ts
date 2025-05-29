import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

interface RealTimeOptions<T> {
  onUpdate: (data: T) => void
  onDelete: (data: { id: string }) => void
  onInsert: (data: T) => void
}

export function useRealTimeUpdates<T>(entity: string, options: RealTimeOptions<T>) {
  useEffect(() => {
    const socket: Socket = io()

    socket.on(`${entity}:updated`, options.onUpdate)
    socket.on(`${entity}:deleted`, options.onDelete)
    socket.on(`${entity}:inserted`, options.onInsert)

    return () => {
      socket.off(`${entity}:updated`)
      socket.off(`${entity}:deleted`)
      socket.off(`${entity}:inserted`)
      socket.disconnect()
    }
  }, [entity, options])
} 