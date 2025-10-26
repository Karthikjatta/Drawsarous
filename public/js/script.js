"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let scatterItems = [];
let doodles = [];
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", () => {
  resize();
  scatterItems = generateScatter();
});

const doodlePaths = [
  "/assets/star.svg",
  "/assets/bowl.svg",
  "/assets/cloud.svg",
  "/assets/diamond.svg",
  "/assets/egg.svg",
  "/assets/paper.svg",
  "/assets/pencil.svg",
  "/assets/square.svg",
];

function loadDoodles(callbacks) {
  let loaded = 0;
  doodlePaths.forEach((path) => {
    let img = new Image();
    img.src = path;
    img.onload = () => {
      doodles.push(img);
      loaded++;
      if (loaded == doodlePaths.length) callbacks();
    };
  });
}

function generateScatter() {
  let items = [];
  const count = 80;
  for (let i = 0; i < count; i++) {
    let img = doodles[Math.floor(Math.random() * doodles.length)];
    items.push({
      img,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40 + Math.random() * 50,
      rotation: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.5 + 0.2,
    });
  }
  return items;
}
let t = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  scatterItems.forEach((item) => {
    ctx.save();
    ctx.translate(item.x, item.y + Math.sin(t * item.drift) * 0.5);

    ctx.rotate(item.rotation + Math.sin(t * 0.01) * 0.05);
    ctx.drawImage(
      item.img,
      -item.size / 2,
      -item.size / 2,
      item.size,
      item.size
    );

    ctx.restore();
  });

  t++;
  requestAnimationFrame(draw);
}

loadDoodles(() => {
  scatterItems = generateScatter();
  draw();
});

const btns = document.querySelectorAll(".btn");
const username = document.querySelector("#username");
const user = localStorage.getItem("username");
if (user != null) {
  username.value = user;
}
// btns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     if (username.value === "" || username.value.length < 3) {
//       username.style.border = "2px solid red";
//       return;
//     } else {
//       username.style.border = "2px solid green";
//     }
//   });
// });

const socket = io();
const create = document.querySelector(".create-btn");
const join = document.querySelector(".join-btn");
create.addEventListener("click", () => {
  if (username.value === "" || username.value.length < 3) {
    username.style.border = "2px solid red";
    return;
  } else {
    username.style.border = "2px solid green";
    window.location.href = "create-room.html";
  }
  localStorage.setItem("username", username.value);
});

join.addEventListener("click", () => {
  if (username.value === "" || username.value.length < 3) {
    username.style.border = "2px solid red";
    return;
  } else {
    username.style.border = "2px solid green";
    // window.location.href = "create-room.html";
  }
  localStorage.setItem("username", username.value);
});

const close = document.querySelector("#closePopupBtn");
const confirmJoinBtn = document.querySelector(".confirmJoinBtn");
const popup = document.querySelector(".popup");
const joinRoomId = document.getElementById("joinRoomId");
close.addEventListener("click", function () {
  popup.style.display = "none";
  joinRoomId.value = "";
});

join.addEventListener("click", function () {
  popup.style.display = "flex";
});

confirmJoinBtn.addEventListener("click", () => {
  const roomId = joinRoomId.value.trim();
  if (!roomId || !username) {
    joinRoomId.style.border = "2px solid red";
    return;
  }
  socket.emit("join-room", { username, roomId });
});

socket.on("joined-room", (msg) => {
  console.log(msg);
  popup.style.display = "none";
  window.location.href = "create-room.html";
});

socket.on("error-msg", (msg) => {
  const errMsg = document.querySelector(".errMsg");
  errMsg.textContent = msg;
  errMsg.style.display = "block";
  errMsg.style.color = "red";
});
