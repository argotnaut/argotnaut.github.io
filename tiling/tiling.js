// Draw a random Truchet tiling on the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// Colors used for the two halves of each tile
let color1 = "#5cb6ff";
let color2 = "#71d9ff";


let tileSize = 50; // default tile size

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
      // drawTriangles(i, j);
      drawQuarterCircles(i, j);
    }
  }
}

document.getElementById("color1").setAttribute("value", color1)
document.getElementById("color1").addEventListener("input", (e) => {
  color1 = e.target.value;
  drawTiling();
});
document.getElementById("color2").setAttribute("value", color2)
document.getElementById("color2").addEventListener("input", (e) => {
  color2 = e.target.value;
  drawTiling();
});
document.getElementById("tileSize").addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  if (val > 0) {
    tileSize = val;
    resizeCanvas();
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
