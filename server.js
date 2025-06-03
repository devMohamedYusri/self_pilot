const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (userId) => {
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

  // Store io instance globally for use in API routes
  global.io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
