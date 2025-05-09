require('dotenv').config();

const express = require('express');
<<<<<<< HEAD
const path = require('path');
=======
const path = require('path'); // Import path module
const app = express();
>>>>>>> 7165612ce93cedb4337699e4fe7099cf81b4b049
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

<<<<<<< HEAD
const PORT = process.env.PORT || 4000;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '../client');
const INDEX_HTML_PATH = process.env.INDEX_HTML_PATH || path.join(STATIC_DIR, 'index.html');

// Validate STATIC_DIR
if (!STATIC_DIR) {
  throw new Error('STATIC_DIR must be defined in .env or fallback to a valid path');
}

// ✅ Serve static files
app.use(express.static(STATIC_DIR));

// ✅ Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(INDEX_HTML_PATH);
=======
// Serve static files from the "client" folder
app.use(express.static(path.join(__dirname, 'client')));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile('E:/real time chat application/client/index.html'); // Absolute path to index.html
>>>>>>> 7165612ce93cedb4337699e4fe7099cf81b4b049
});


let users = {};       // socket.id -> nickname
let nicknames = {};   // nickname -> socket.id

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('set nickname', (nickname) => {
    users[socket.id] = nickname;
    nicknames[nickname] = socket.id;
    socket.broadcast.emit('chat message', { nickname: 'System', text: `🔵 ${nickname} joined` });
    io.emit('user list', Object.values(users));
  });

  socket.on('chat message', (msg) => {
    const { text, nickname } = msg;

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

  socket.on('typing', (nickname) => {
    socket.broadcast.emit('typing', nickname);
  });

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

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
