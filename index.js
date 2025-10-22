const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- EVENTOS SOCKET ---
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Identificación del usuario
  socket.on('identify', (payload) => {
    const username = payload?.username || 'Anon';
    const requestedRoom = payload?.room;
    socket.data.username = username;

    console.log(`Socket ${socket.id} identificado como ${username}`);

    // Unirse a la sala si se proporciona
    if (requestedRoom) {
      socket.join(requestedRoom);
      socket.data.room = requestedRoom;
      socket.to(requestedRoom).emit('msg', `Sistema: ${username} se unió a la sala ${requestedRoom}`);
      console.log(`${username} se unió a sala ${requestedRoom}`);
    }

    // Mensaje de bienvenida
    socket.emit('msg', `Bienvenido ${username} al servidor`);
  });

  // Unirse a sala en cualquier momento
  socket.on('join_room', ({ room }) => {
    const username = socket.data.username || 'Anon';
    if (!room) return;

    const prevRoom = socket.data.room;
    if (prevRoom && prevRoom !== room) {
      socket.leave(prevRoom);
      socket.to(prevRoom).emit('msg', `Sistema: ${username} salió de la sala ${prevRoom}`);
    }

    socket.join(room);
    socket.data.room = room;
    socket.to(room).emit('msg', `Sistema: ${username} se unió a la sala ${room}`);
    socket.emit('msg', `Sistema: Te uniste a la sala ${room}`);
    console.log(`${username} (${socket.id}) entró a ${room}`);
  });

  // Envío de mensajes (stream)
  socket.on('stream', (payload) => {
    let text = '';
    let room = socket.data.room;

    if (typeof payload === 'string') text = payload;
    else if (typeof payload === 'object') {
      text = payload.text || '';
      room = payload.room || room;
    }

    const username = socket.data.username || 'Anon';
    console.log(`Mensaje de ${username} (${socket.id}) en sala ${room}: ${text}`);

    if (room) socket.to(room).emit('stream', { from: username, text });
    else socket.broadcast.emit('stream', { from: username, text });
  });

  // Desconexión
  socket.on('disconnect', (reason) => {
    console.log('Cliente desconectado', socket.id, 'razón:', reason);
    const username = socket.data.username || 'Anon';
    const room = socket.data.room;
    if (room) socket.to(room).emit('msg', `Sistema: ${username} se desconectó`);
  });

  socket.on('error', (err) => {
    console.log('Socket error', err);
  });
});

// Endpoint básico
app.get('/', (_, res) => {
  res.send('Socket.IO server running');
});

// Puerto
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
