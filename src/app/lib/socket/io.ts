// lib/socket/io.ts

import { Server as HTTPServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { NextApiResponse } from 'next'

export const initSocket = (server: HTTPServer) => {
  const io = new SocketServer(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Entity CRUD events
    const entities = ['task', 'goal', 'habit', 'routine', 'journal']
    entities.forEach(entity => {
      socket.on(`${entity}:create`, (data) => {
        const userId = data.userId
        socket.to(`user:${userId}`).emit(`${entity}:created`, data)
      })

      socket.on(`${entity}:update`, (data) => {
        const userId = data.userId
        socket.to(`user:${userId}`).emit(`${entity}:updated`, data)
      })

      socket.on(`${entity}:delete`, (data) => {
        const userId = data.userId
        socket.to(`user:${userId}`).emit(`${entity}:deleted`, data)
      })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}