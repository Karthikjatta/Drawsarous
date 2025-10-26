const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const tools = document.querySelectorAll(".tool");
const fillcolor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvas = document.querySelector(".clear-canvas");
const saveImage = document.querySelector(".save-image");
let preMouseX, preMouseY, snapshot;
let brushWidth = 5;
let isDrawing = false;
let selectedTool = "brush";
let selectedColor = "#fff";
window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});
const drawRect = (e) => {
  if (!fillcolor.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      preMouseX - e.offsetX,
      preMouseY - e.offsetY
    );
  }
  return ctx.fillRect(
    e.offsetX,
    e.offsetY,
    preMouseX - e.offsetX,
    preMouseY - e.offsetY
  );
};
const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(preMouseX - e.offsetX, 2) + Math.pow(preMouseY - e.offsetY, 2)
  );
  ctx.arc(preMouseX, preMouseY, radius, 0, 2 * Math.PI);
  fillcolor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(preMouseX, preMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(preMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  !fillcolor.checked ? ctx.stroke() : ctx.fill();
};
const drawing = (e) => {
  if (isDrawing) {
    ctx.putImageData(snapshot, 0, 0);
    if (selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    } else if (selectedTool == "rectangle") {
      drawRect(e);
    } else if (selectedTool === "circle") {
      drawCircle(e);
    } else {
      drawTriangle(e);
    }
  }
};

tools.forEach((tool) => {
  tool.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    tool.classList.add("active");
    selectedTool = tool.id;
  });
});
sizeSlider.addEventListener("change", () => {
  return (brushWidth = sizeSlider.value);
});
const startDraw = (e) => {
  isDrawing = true;
  preMouseX = e.offsetX;
  preMouseY = e.offsetY;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  ctx.lineWidth = brushWidth;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

colorBtns.forEach((btns) => {
  btns.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btns.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btns)
      .getPropertyValue("background-color");
  });
});
const stopDraw = () => {
  isDrawing = false;
};

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
saveImage.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
