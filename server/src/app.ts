// import { createServer } from 'http'
import { createServer } from 'https'
import { Server } from 'socket.io'
import path from 'path'
import fs from 'fs'

const keyPath = path.resolve(__dirname, '../../cert/localhost+3-key.pem')
const certPath = path.resolve(__dirname, '../../cert/localhost+3.pem')

const httpServer = createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
})
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  // ...
  console.log(io.sockets.sockets.size)
  socket.on('join', ({ roomName, userName, id }) => {
    socket.join(roomName)
    io.to(roomName).emit('new-user', {
      userName,
      id
    })
  })

  // create-offer
  socket.on('create-offer', (targetId, data) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === targetId) {
        s.emit('create-offer', data)
      }
    })
  })

  // answer
  socket.on('create-answer', (targetId, data) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === targetId) {
        s.emit('create-answer', data)
      }
    })
  })

  // new-ice
  socket.on('new-ice-candidate', (targetId, data) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === targetId) {
        s.emit('new-ice-candidate', data)
      }
    })
  })
})

httpServer.listen(3001)
