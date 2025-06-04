// types/global.d.ts
import { Server as SocketIOServer } from 'socket.io'

declare global {
  interface Window {
    io: SocketIOServer
  }
}

// If you need to access it in Node.js environment
declare global {
  namespace NodeJS {
    interface Global {
      io: SocketIOServer
    }
  }
}

export {}