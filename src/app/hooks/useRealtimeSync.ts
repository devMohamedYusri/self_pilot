import { useEffect, useCallback } from 'react'
import { useSocket } from '@/app/contexts/socket-context'

export function useRealtimeSync<T>(
  entityName: string,
  onUpdate: (data: T) => void,
  onDelete: (id: string) => void
) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleCreated = (data: T) => {
      onUpdate(data)
    }

    const handleUpdated = (data: T) => {
      onUpdate(data)
    }

    const handleDeleted = (data: { id: string }) => {
      onDelete(data.id)
    }

    socket.on(`${entityName}:created`, handleCreated)
    socket.on(`${entityName}:updated`, handleUpdated)
    socket.on(`${entityName}:deleted`, handleDeleted)

    return () => {
      socket.off(`${entityName}:created`, handleCreated)
      socket.off(`${entityName}:updated`, handleUpdated)
      socket.off(`${entityName}:deleted`, handleDeleted)
    }
  }, [socket, entityName, onUpdate, onDelete])

  const emit = useCallback((action: string, data: any) => {
    if (socket) {
      socket.emit(`${entityName}:${action}`, data)
    }
  }, [socket, entityName])

  return { emit }
}