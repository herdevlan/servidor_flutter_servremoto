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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;

    console.log(`👤 ${username} se unió a la sala ${room}`);

    // Solo el usuario que se une recibe el mensaje de bienvenida
    socket.emit("msg", `Bienvenido ${username} al área ${room}`);

    // Los demás usuarios en la sala reciben notificación
    socket.broadcast.to(room).emit("msg", `👋 ${username} se unió al área`);
  });

  socket.on("stream", (data) => {
    const user = socket.data.username || "Anónimo";
    const room = socket.data.room || "General";

    // Manejar tanto objeto como string
    let messageText = "";
    if (typeof data === "string") {
      messageText = data;
    } else if (typeof data === "object" && data.message) {
      messageText = data.message;
    }

    // Mostrar en consola correctamente
    console.log(`[${room}] ${user}: ${messageText}`);

    // Emitir solo a los demás en la sala (el emisor no lo recibe de nuevo)
    socket.to(room).emit("stream", {
      username: user,
      message: messageText,
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.data.username || socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("💬 Servidor Socket.io de Chat Empresarial activo 🚀");
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
