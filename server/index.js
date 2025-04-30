const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + './client/index.html');
});

let users = {};       // socket.id -> nickname
let nicknames = {};   // nickname -> socket.id

io.on('connection', (socket) => {
  console.log('A user connected');

  // Set nickname
  socket.on('set nickname', (nickname) => {
    users[socket.id] = nickname;
    nicknames[nickname] = socket.id;

    socket.broadcast.emit('chat message', { nickname: 'System', text: `🔵 ${nickname} joined` });
    io.emit('user list', Object.values(users));
  });

  // Message handler
  socket.on('chat message', (msg) => {
    const { text, nickname } = msg;

    // Handle private message
    if (text.startsWith('@')) {
      const spaceIndex = text.indexOf(' ');
      if (spaceIndex !== -1) {
        const targetName = text.substring(1, spaceIndex);
        const messageText = text.substring(spaceIndex + 1);
        const targetSocketId = nicknames[targetName];

        if (targetSocketId) {
          const privateMsg = { nickname: `🔒 ${nickname}`, text: messageText };
          io.to(targetSocketId).emit('chat message', privateMsg);
          socket.emit('chat message', privateMsg);
        } else {
          socket.emit('chat message', { nickname: 'System', text: `User @${targetName} not found.` });
        }
      }
    } else {
      socket.broadcast.emit('chat message', msg);
    }
  });

  // Typing indicator
  socket.on('typing', (nickname) => {
    socket.broadcast.emit('typing', nickname);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    delete nicknames[nickname];
    delete users[socket.id];
    if (nickname) {
      socket.broadcast.emit('chat message', { nickname: 'System', text: `🔴 ${nickname} left` });
      io.emit('user list', Object.values(users));
    }
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
