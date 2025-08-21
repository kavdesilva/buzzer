const express = require('express')
const port = process.env.PORT || 3000;
const http = require('http')
const { Server } = require('socket.io')
const path = require('path');

const app = express();
const server = http.createServer(app)
const io = new Server(server)

const takenColors = new Set()
const activePlayers = new Map() // color -> socket.id

app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'index.html'))
});

io.on('connection', (socket) => {
  console.log('New user connected.')
  
  const activeColors = Array.from(activePlayers.keys())
  if (activeColors.length > 0) {
    socket.emit('initialState', activeColors)
  }

  socket.on('register', (color) => {
    socket.data.selectedColor = color
    takenColors.add(color)
    activePlayers.set(color, socket.id)
    console.log(`Team ${socket.data.selectedColor} registered.`)
    console.log('Active players:', Array.from(activePlayers.entries()))
    io.emit('colorTaken', color)
  })

  socket.on('buzz', (color) => {
    console.log('Buzzed:', color.name)
    io.emit('buzz', color)
  })

  socket.on('lock', (message) => {
    console.log(message)
  })
  
  socket.on('disconnect', () => {
    if (socket.data.selectedColor) {
      const color = socket.data.selectedColor
      activePlayers.delete(color)
      console.log(`Team ${color} disconnected.`)
      if (!activePlayers.has(color)) {
        takenColors.delete(color)
        console.log(`Color ${color} is now available for new players`)
        io.emit('colorAvailable', color)
      }
    } else {
      console.log('User disconnected.')
    }
  })
})

server.listen(3000, () => {
  console.log(`server running at ${port}`);
});


