// app/hooks/useRealTimeUpdates.ts
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

// Global socket instance with proper cleanup
let globalSocket: Socket | null = null
let socketUsers = 0

export function useRealTimeUpdates<T>(
  entity: string,
  handlers: {
    onUpdate?: (data: T) => void
    onDelete?: (data: { id: string }) => void
    onInsert?: (data: T) => void
  }
) {
  const { data: session, status } = useSession()
  const handlersRef = useRef(handlers)
  const entityRef = useRef(entity)

  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current = handlers
    entityRef.current = entity
  }, [handlers, entity])

  // Memoized handler functions to prevent reconnections
  const onInsert = useCallback((data: T) => {
    handlersRef.current.onInsert?.(data)
  }, [])

  const onUpdate = useCallback((data: T) => {
    handlersRef.current.onUpdate?.(data)
  }, [])

  const onDelete = useCallback((data: { id: string }) => {
    handlersRef.current.onDelete?.(data)
  }, [])

  useEffect(() => {
    // Don't connect if session is loading or user not authenticated
    if (status === 'loading' || !session?.user?.id) {
      return
    }

    // Initialize socket connection
    if (!globalSocket) {
      globalSocket = io({
        path: '/api/socket',
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true
      })

      globalSocket.on('connect', () => {
        console.log('Connected to server')
        if (session?.user?.id) {
          globalSocket?.emit('join-room', session.user.id)
        }
      })

      globalSocket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason)
      })

      globalSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        console.error('Error details:', {
          message: error.message,
        })
      })

      globalSocket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts')
      })

      globalSocket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error)
      })
    }

    // Track socket usage
    socketUsers++

    // Connect if not already connected
    if (!globalSocket.connected) {
      globalSocket.connect()
    }

    // Set up entity-specific listeners
    const createdEvent = `${entity}:created`
    const updatedEvent = `${entity}:updated`
    const deletedEvent = `${entity}:deleted`

    globalSocket.on(createdEvent, onInsert)
    globalSocket.on(updatedEvent, onUpdate)
    globalSocket.on(deletedEvent, onDelete)

    // Join room for this user
    if (globalSocket.connected) {
      globalSocket.emit('join-room', session.user.id)
    }

    // Cleanup function
    return () => {
      if (globalSocket) {
        globalSocket.off(createdEvent, onInsert)
        globalSocket.off(updatedEvent, onUpdate)
        globalSocket.off(deletedEvent, onDelete)
      }

      socketUsers--

      // Only disconnect when no components are using the socket
      if (socketUsers === 0 && globalSocket) {
        globalSocket.disconnect()
        globalSocket = null
      }
    }
  }, [session?.user?.id, status, entity, onInsert, onUpdate, onDelete])

  // Return connection status and manual control functions
  return {
    isConnected: globalSocket?.connected ?? false,
    socket: globalSocket,
    reconnect: () => {
      if (globalSocket && !globalSocket.connected) {
        globalSocket.connect()
      }
    },
    disconnect: () => {
      if (globalSocket && globalSocket.connected) {
        globalSocket.disconnect()
      }
    }
  }
}