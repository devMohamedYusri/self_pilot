'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { useToast } from '@chakra-ui/react'
import { aiNotificationManager } from '@/lib/notifications/AINotificationManager'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data: any) => void
  on: (event: string, handler: (...args: any[]) => void) => void
  off: (event: string, handler: (...args: any[]) => void) => void
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
      socketInstance.on('ai:suggestion:new', (data) => {
        aiNotificationManager.notify({
          type: 'task_suggestion',
          data,
          metadata: {
            priority: 'high',
            requiresAction: true
          }
        })
      })

      socketInstance.on('ai:analyzing', (data) => {
        toast({
          title: 'AI Analyzing',
          description: `Analyzing your ${data.entity}...`,
          status: 'info',
          duration: 2000,
          position: 'bottom',
        })
      })

      socketInstance.on('ai:processing', (data) => {
        toast({
          title: 'AI Processing',
          description: 'Your request is being processed',
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

  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    }
  }, [socket])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, handler)
    }
  }, [socket])

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, handler)
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