const tilingCanvas = document.getElementById("canvas");
const tilingCanvasContext = canvas.getContext("2d");

function resizeCanvas(ctx, canvas, shape, primaryColor, backgroundColor, tileSize) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawTiling(ctx, canvas, shape, primaryColor, backgroundColor, tileSize);
}

function circularShiftArray(inputArray, nShifts) {
  splitIdx = nShifts % inputArray.length;
  return inputArray.slice(splitIdx).concat(inputArray.slice(0, splitIdx));
}

function drawTriangles(i, j, ctx, color, tileSize) {
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

  // Draw first triangle with color
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + shiftedCornersMatrix[0][0], y + shiftedCornersMatrix[0][1]);
  ctx.lineTo(x + shiftedCornersMatrix[1][0], y + shiftedCornersMatrix[1][1]);
  ctx.lineTo(x + shiftedCornersMatrix[2][0], y + shiftedCornersMatrix[2][1]);
  ctx.closePath();
  ctx.fill();

  // (The second triangle will be the negative space in the background)
}

function drawQuarterCircles(i, j, ctx, color, tileSize) {
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
  ctx.strokeStyle = color;
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

function drawTiling(ctx, canvas, shape, primaryColor, backgroundColor, tileSize) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.background = backgroundColor;
  const rows = Math.ceil(canvas.height / tileSize);
  const cols = Math.ceil(canvas.width / tileSize);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (shape === "triangles") {
        drawTriangles(i, j, tilingCanvasContext, primaryColor, tileSize);
      } else {
        drawQuarterCircles(i, j, tilingCanvasContext, primaryColor, tileSize);
      }
    }
  }
}