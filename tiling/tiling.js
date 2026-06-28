// Draw a random Truchet tiling on the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// Retrieve stored values or use defaults
function getStoredItem(key, defaultVal) {
  const stored = localStorage.getItem(key);
  return stored ? stored : defaultVal;
}
let color1 = getStoredItem("color1", "#5cb6ff");
let color2 = getStoredItem("color2", "#71d9ff");
// Current shape: 'triangles' or 'quarters'
let currentShape = getStoredItem("shape", "quarters");


let tileSize = 20; // default tile size

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawTiling();
}

function circularShiftArray(inputArray, nShifts) {
  splitIdx = nShifts % inputArray.length;
  return inputArray.slice(splitIdx).concat(inputArray.slice(0, splitIdx));
}

function drawTriangles(i, j) {
  const x = j * tileSize;
  const y = i * tileSize;

  /* 
      The points around the tile. The drawing code will walk through this
      array in order as it's drawing the two triangles
      */
  cornersMatrix = [
    [0, 0], // top-left
    [tileSize, 0], // top-right
    [tileSize, tileSize], // bottom-right
    [0, tileSize], // bottom left
  ];
  /*
      Shift the cornersMatrix that the drawing code will walk through so it
      starts at the random index
      */
  const shiftedCornersMatrix = circularShiftArray(
    cornersMatrix,
    Math.round(Math.random() * 3),
  );

  // Draw first triangle with color1
  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.moveTo(x + shiftedCornersMatrix[0][0], y + shiftedCornersMatrix[0][1]);
  ctx.lineTo(x + shiftedCornersMatrix[1][0], y + shiftedCornersMatrix[1][1]);
  ctx.lineTo(x + shiftedCornersMatrix[2][0], y + shiftedCornersMatrix[2][1]);
  ctx.closePath();
  ctx.fill();

  // (The second triangle will be the negative space in the background)
}

function drawQuarterCircles(i, j) {
  const x = j * tileSize;
  const y = i * tileSize;

  const topLeftBottomRight = {
    corners: [
      {x: 0, y: 0},
      {x: tileSize, y: tileSize}
    ],
    angles: [
      { start: 0, end: 1/2 * Math.PI},
      { start: Math.PI, end: 3/2 * Math.PI}
    ]
  };
  const topRightBottomLeft = {
    corners: [
      {x: tileSize, y: 0},
      {x: 0, y: tileSize}
    ],
    angles: [
      {start: 1/2 * Math.PI, end: Math.PI},
      {start: 3/2 * Math.PI, end: 0}
    ]
  };
  
  orientation = topLeftBottomRight;
  if (Math.random() > 0.5) {
    orientation = topRightBottomLeft;
  }
  ctx.lineWidth = 5;
  ctx.strokeStyle = color1;
  ctx.beginPath();
  ctx.arc(
    x + orientation.corners[0].x,
    y + orientation.corners[0].y,
    0.5 * tileSize,
    orientation.angles[0].start,
    orientation.angles[0].end
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + orientation.corners[1].x,
    y + orientation.corners[1].y,
    0.5 * tileSize,
    orientation.angles[1].start,
    orientation.angles[1].end,
  );
  
  ctx.stroke();
}

function drawTiling() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.background = color2;
  const rows = Math.ceil(canvas.height / tileSize);
  const cols = Math.ceil(canvas.width / tileSize);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (currentShape === "triangles") {
        drawTriangles(i, j);
      } else {
        drawQuarterCircles(i, j);
      }
    }
  }
}

document.getElementById("color1").value = color1;
document.getElementById("shape").value = currentShape;
document.getElementById("color1").addEventListener("input", (e) => {
  color1 = e.target.value;
  localStorage.setItem("color1", color1);
  drawTiling();
});
document.getElementById("color2").value = color2;
document.getElementById("color2").addEventListener("input", (e) => {
  color2 = e.target.value;
  localStorage.setItem("color2", color2);
  drawTiling();
});
document.getElementById("tileSize").addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  if (val > 0) {
    tileSize = val;
    resizeCanvas();
  }
});

// Shape selector
document.getElementById("shape").addEventListener("change", (e) => {
  currentShape = e.target.value;
  localStorage.setItem("shape", currentShape);
  drawTiling();
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
