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
  socket.on('join', (romId) => {
    socket.join(romId)
    io.to(romId).emit('new-user', {
      user: {
        id: socket.id
      },
      msg: `欢迎新用户：${socket.id}，来到房间：${romId}`
    })
    console.log(socket.rooms)
    // 通知房间里的人，交换协议？
  })

  // create-offer
  socket.on('create-offer', (data: { targetId: string, sdp: string }) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === data.targetId) {
        s.emit('create-offer', { originId: socket.id, sdp: data.sdp })
      }
    })
  })

  // answer
  socket.on('create-answer', (data: { targetId: string, sdp: string }) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === data.targetId) {
        s.emit('create-answer', { originId: socket.id, sdp: data.sdp })
      }
    })
  })

  // new-ice
  socket.on('new-ice', (data: { targetId: string, ice: string }) => {
    io.sockets.sockets.forEach(s => {
      if (s.id === data.targetId) {
        s.emit('new-ice', { originId: socket.id, ice: data.ice })
      }
    })
  })
})

httpServer.listen(3001)
