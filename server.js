"use strict";
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("create-room", ({ username }) => {
    const roomId = uuidv4().slice(0, 6).toUpperCase();
    rooms[roomId] = {
      hostId: socket.id,
      players: [{ id: socket.id, username, score: 0 }],
    };
    socket.join(roomId);

    io.to(socket.id).emit("room-created", {
      roomId,
      players: rooms[roomId].players,
      hostId: socket.id,
    });

    console.log(`Room ${roomId} created by ${username}`);
  });

  // Join a room
  socket.on("join-room", ({ username, roomId }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error-msg", "Room doesn't exist");
      return;
    }

    room.players.push({ id: socket.id, username, score: 0 });
    socket.join(roomId);
    socket.emit("joined-room", "person is joined");
    io.to(roomId).emit("updated-player-list", {
      players: room.players,
      hostId: room.hostId,
    });

    io.to(roomId).emit("chat-message", {
      username: "System",
      message: `${username} joined the room!`,
    });

    console.log(`${username} joined room ${roomId}`);
  });

  socket.on("start-game", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    if (socket.id !== room.hostId) {
      socket.emit("error-msg", "Only the host can start the game!");
      return;
    }

    if (room.players.length < 3) {
      socket.emit("error-msg", "Need at least 3 players to start the game!");
      return;
    }

    io.to(roomId).emit("game-started", roomId);
    console.log(`Game started in room ${roomId}`);
  });

  socket.on("send-message", ({ roomId, username, message }) => {
    io.to(roomId).emit("chat-message", { username, message });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const index = room.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        const leftPlayer = room.players.splice(index, 1)[0];

        io.to(roomId).emit("updated-player-list", {
          players: room.players,
          hostId: room.hostId,
        });

        io.to(roomId).emit("chat-message", {
          username: "System",
          message: `${leftPlayer.username} left the room!`,
        });

        console.log(`${leftPlayer.username} left room ${roomId}`);

        if (socket.id === room.hostId && room.players.length > 0) {
          room.hostId = room.players[0].id;
          io.to(roomId).emit("updated-player-list", {
            players: room.players,
            hostId: room.hostId,
          });
        }

        // Delete room if empty
        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        }
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
