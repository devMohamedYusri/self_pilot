import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(userId?: string): Socket {
    if (!this.socket || !this.socket.connected) {
      this.socket = io({
        path: '/api/socket',
        transports: ['polling', 'websocket']
      })

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id)
        if (userId) {
          this.socket?.emit('join-room', userId)
        }
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason)
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export default SocketManager