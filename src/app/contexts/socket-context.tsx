'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { useToast } from '@chakra-ui/react'
import { aiNotificationManager } from '@/app/lib/notifications/AINotificationManager'
import type { 
  SocketEventMap, 
  AISocketEvent,
  AINotificationData,
  SocketEventHandler,
  AINotification
} from '@/app/types'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: <K extends keyof SocketEventMap>(event: K, data: SocketEventMap[K]) => void
  on: <K extends keyof SocketEventMap>(
    event: K, 
    handler: (data: SocketEventMap[K]) => void
  ) => void
  off: <K extends keyof SocketEventMap>(
    event: K, 
    handler: (data: SocketEventMap[K]) => void
  ) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
  on: () => {},
  off: () => {},
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()
  const toast = useToast()

  useEffect(() => {
    if (session?.user) {
      const socketInstance = io({
        auth: {
          token: session.user.id
        }
      })

      socketInstance.on('connect', () => {
        console.log('Socket connected')
        setIsConnected(true)
        toast({
          title: 'Connected',
          description: 'Real-time sync active',
          status: 'success',
          duration: 2000,
          position: 'bottom-left',
        })
      })

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
        toast({
          title: 'Disconnected',
          description: 'Real-time sync paused',
          status: 'warning',
          duration: 2000,
          position: 'bottom-left',
        })
      })

      // AI-specific events
      socketInstance.on('ai:suggestion:new', (data: AINotificationData) => {
        if (data.type === 'task_suggestion') {
          const notification = {
            type: 'task_suggestion' as const,
            data: {
              id: data.data.id,
              message: data.data.message,
              task: data.data.task
            },
            metadata: {
              priority: 'high' as const,
              requiresAction: true
            }
          }
          aiNotificationManager.notify(notification)
        }
      })

      socketInstance.on('ai:analyzing', (data: AISocketEvent) => {
        toast({
          title: 'AI Analyzing',
          description: `Analyzing your ${data.entity}...`,
          status: 'info',
          duration: 2000,
          position: 'bottom',
        })
      })

      socketInstance.on('ai:processing', (data: { message?: string }) => {
        toast({
          title: 'AI Processing',
          description: data.message || 'Your request is being processed',
          status: 'info',
          duration: 2000,
          position: 'bottom',
        })
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [session, toast])

  const emit = useCallback(<K extends keyof SocketEventMap>(
    event: K, 
    data: SocketEventMap[K]
  ) => {
    if (socket?.connected) {
      socket.emit(event as string, data)
    }
  }, [socket])

  const on = useCallback(<K extends keyof SocketEventMap>(
    event: K, 
    handler: (data: SocketEventMap[K]) => void
  ) => {
    if (socket) {
      // Fixed: Use proper type casting instead of any
      const socketHandler: SocketEventHandler = handler as SocketEventHandler
      socket.on(event as string, socketHandler)
    }
  }, [socket])

  const off = useCallback(<K extends keyof SocketEventMap>(
    event: K, 
    handler: (data: SocketEventMap[K]) => void
  ) => {
    if (socket) {
      // Fixed: Use proper type casting instead of any
      const socketHandler: SocketEventHandler = handler as SocketEventHandler
      socket.off(event as string, socketHandler)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}