// Draw a random Truchet tiling on the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let tileSize = 50; // you can adjust this

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawTiling();
}

function circularShiftArray(inputArray, nShifts) {
  splitIdx = nShifts % inputArray.length;
  return inputArray.slice(splitIdx).concat(inputArray.slice(0, splitIdx));
}

function drawTiling() {
  const rows = Math.ceil(canvas.height / tileSize);
  const cols = Math.ceil(canvas.width / tileSize);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * tileSize;
      const y = i * tileSize;

      /* 
      The points around the tile. The drawing code will walk through this
      array in order as it's drawing the two triangles
      */
      pointsMatrix = [
        [0, 0], // top-left
        [tileSize, 0], // top-right
        [tileSize, tileSize], // bottom-right
        [0, tileSize], // bottom left
      ];
      /*
      Shift the pointsMatrix that the drawing code will walk through so it
      starts at the random index
      */
      const shiftedPointsMatrix = circularShiftArray(
        pointsMatrix,
        Math.round(Math.random() * 3),
      );

      // Randomly choose the color
      const color = Math.random() < 0.5 ? -1 : 1;
      const getColor = (num) => (num > 0 ? "#000000" : "#FF0000");
      // Draw the tile
      ctx.fillStyle = getColor(color); // use the randomly chosen color
      ctx.beginPath();
      ctx.moveTo(x + shiftedPointsMatrix[0][0], y + shiftedPointsMatrix[0][1]);
      ctx.lineTo(x + shiftedPointsMatrix[1][0], y + shiftedPointsMatrix[1][1]);
      ctx.lineTo(x + shiftedPointsMatrix[2][0], y + shiftedPointsMatrix[2][1]);
      ctx.closePath();
      ctx.fill(); // Halfway through the array of points, close the first triangle and start the next one
      ctx.fillStyle = getColor(color * -1); // use the other color
      ctx.beginPath();
      ctx.moveTo(x + shiftedPointsMatrix[2][0], y + shiftedPointsMatrix[2][1]);
      ctx.lineTo(x + shiftedPointsMatrix[3][0], y + shiftedPointsMatrix[3][1]);
      ctx.lineTo(x + shiftedPointsMatrix[0][0], y + shiftedPointsMatrix[0][1]);
      ctx.closePath();
      ctx.fill(); // At the end of the array of points, close the second triangle at the start of the first one
    }
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
