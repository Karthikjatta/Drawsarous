"use strict";

const socket = io();
const playerList = document.getElementById("playerList");
const startBtn = document.getElementById("startBtn");
const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");
const copyBtn = document.getElementById("copyBtn");
const roomIdElem = document.getElementById("roomid");

const username =
  localStorage.getItem("username") ||
  "Player" + Math.floor(Math.random() * 100);

// Create room
socket.emit("create-room", { username });

// ROOM CREATED
socket.on("room-created", ({ roomId, players, hostId }) => {
  roomIdElem.textContent = roomId;
  updatePlayerList(players, hostId);
});

// UPDATE PLAYER LIST
socket.on("updated-player-list", ({ players, hostId }) => {
  updatePlayerList(players, hostId);
});

// CHAT MESSAGE
socket.on("chat-message", ({ username, message }) => {
  appendMessage(username, message);
});

// ERROR
socket.on("error-msg", (msg) => alert(msg));

// GAME STARTED
socket.on("game-started", (roomId) => {
  window.location.href = `../paintClone/paint.html?roomId=${roomId}`;
});

// Send chat message
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const message = chatInput.value.trim();
    if (!message) return;

    const roomId = getRoomId();
    socket.emit("send-message", { roomId, username, message });
    chatInput.value = "";
  }
});

// Start game
startBtn.addEventListener("click", () => {
  const roomId = getRoomId();
  socket.emit("start-game", roomId);
});

// Copy Room ID
copyBtn.addEventListener("click", () => {
  const roomId = getRoomId();
  navigator.clipboard
    .writeText(roomId)
    .then(() => alert("Room ID copied"))
    .catch(() => alert("Failed to copy"));
});

// HELPER: Update player list
function updatePlayerList(players, hostId) {
  playerList.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.username + (player.id === hostId ? " (Host)" : "");
    if (player.id === hostId) li.classList.add("host");
    li.classList.add("player");
    playerList.appendChild(li);
  });
}

// HELPER: Append message
function appendMessage(username, message) {
  const p = document.createElement("p");
  p.textContent = `${username}: ${message}`;
  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

// HELPER: Get room ID
function getRoomId() {
  return roomIdElem.textContent.trim();
}
