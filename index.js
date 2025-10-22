/*import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("stream", (data) => {
    console.log("Data recibida:", data);
    socket.broadcast.emit("stream", data);
  });

  setTimeout(() => {
    socket.emit("msg", "Bienvenido al Chat");
  }, 3000);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Servidor Socket.io activo 🚀");
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
*/

import express from "express";
import http from "http";
import { Server } from "socket.io";

// Inicializar Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// Inicializar Socket.IO con CORS abierto
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Manejo de conexiones de clientes
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // Evento para unirse o cambiar de sala
  socket.on("joinRoom", ({ username, room }) => {
    // Si ya estaba en otra sala, salir
    if (socket.data.room) {
      socket.leave(socket.data.room);
      socket.broadcast
        .to(socket.data.room)
        .emit("msg", `👋 ${username} ha salido del área ${socket.data.room}`);
    }

    // Entrar a la nueva sala
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;

    console.log(`👤 ${username} se unió a la sala ${room}`);
    socket.emit("msg", `Bienvenido ${username} al área ${room}`);
    socket.broadcast.to(room).emit("msg", `👋 ${username} se unió al área`);
  });

  // Evento de mensaje enviado
  socket.on("stream", (data) => {
    const user = socket.data.username || "Anónimo";
    const room = socket.data.room || "General";
    const message = `${user}: ${data}`;
    console.log(`[${room}] ${message}`);
    io.to(room).emit("stream", message);
  });

  // Manejo de desconexión
  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.data.username || socket.id}`);
    if (socket.data.room) {
      socket.broadcast
        .to(socket.data.room)
        .emit("msg", `👋 ${socket.data.username} ha salido del área`);
    }
  });
});

// Ruta HTTP para verificar servidor activo
app.get("/", (req, res) => {
  res.send("💬 Servidor Socket.io de Chat Empresarial activo 🚀");
});

// Puerto dinámico de Render o 3003 por defecto
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
