document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("colorInput");
  const preview = document.getElementById("preview");

  function update() {
    const val = input.value;
    preview.style.backgroundColor = val;
    preview.textContent = val.toUpperCase();
    baseColor = val.toUpperCase();
    recalculateColors();
  }

  input.addEventListener("input", update);
  // create color wheel
  const wheelDiv = document.getElementById("color-wheel");
  const wheelCanvas = document.createElement("canvas");
  wheelCanvas.width = 200;
  wheelCanvas.height = 200;
  wheelDiv.appendChild(wheelCanvas);
  drawColorWheel(wheelCanvas);
  update();
});

/**
 * Returns a matrix whose colums comprise a basis set for the vector
 * space where the z-axis is the longest diagonal across the color
 * cube (i.e. the space where <r=1, g=1, b=1> in the color space
 * corresponds to <0, 0, 1>)
 * @returns {Matrix3D}
 */
function getColorSpaceRotationBasisSet() {
  let output = Matrix3D.identity();
  return output.multiply(Matrix3D.rotationMatrix(Math.PI / 4, 0, Math.PI / 4));
}

/**
 * Returns a transform matrix for rotating a vector by a given
 * angle in radians around the longest diagonal of the color cube
 * @returns {Matrix3D}
 */
function rotateVectorAroundDiagonal(theta) {
  const colorSpaceRotationSet = getColorSpaceRotationBasisSet();
  return colorSpaceRotationSet
    .getInverse()
    .multiply(
      /*
    getColorSpaceRotationBasisSet creates a basis set where the color
    cube's diagonal is the z basis vector, hence rotating the vector around
    the z-axis by theta radians here
    */
      Matrix3D.rotationMatrix(0, 0, theta),
    )
    .multiply(colorSpaceRotationSet);
}

function multiply(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array(aNumRows); // initialize array of rows
  var output = new Array(aNumRows);
  for (var r = 0; r < aNumRows; ++r) {
    output[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      output[r][c] = 0; // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        output[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return output;
}

function drawColorWheel(canvas) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = (Math.min(width, height) / 2) * 0.9;
  const innerRadius = outerRadius * 0.6;
  const steps = 360;
  const slice = (Math.PI * 2) / steps;
  for (let i = 0; i < steps; i++) {
    const start = i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, start, end);
    ctx.arc(cx, cy, innerRadius, end, start, true);
    ctx.closePath();
    ctx.fillStyle = "hsl(" + i + ",100%,50%)";
    ctx.strokeStyle = "hsl(" + i + ",100%,50%)";
    ctx.stroke();
    ctx.fill();
  }
}

function vectorToColor(input) {
  function toPaddedHex(n) {
    n = Math.max(0, Math.min(Math.round(n), 255));
    return n < 16 ? "0" + n.toString(16) : n.toString(16);
  }
  return (
    "#" + toPaddedHex(input.x) + toPaddedHex(input.y) + toPaddedHex(input.z)
  );
}

function vectorFromColorString(input) {
  input = input.replaceAll("#", "");
  return new Vector(
    Number("0x" + input.substr(0, 2)),
    Number("0x" + input.substr(2, 2)),
    Number("0x" + input.substr(4, 2)),
  );
}

function rotateColor(input, theta) {
  let inputVector = vectorFromColorString(input);
  const diagVector = new Vector(1, 1, 1);

  let rotatedColorVector = inputVector.rotateAroundVector(theta, diagVector);
  rotatedColorVector = new Vector(
    Math.min(255, rotatedColorVector.x),
    Math.min(255, rotatedColorVector.y),
    Math.min(255, rotatedColorVector.z),
  );
  return vectorToColor(rotatedColorVector);
}

function getComplimentaryColors(input) {
  let colors = [input];
  colors.push(rotateColor(input, Math.PI));
  return colors;
}

function getAnalogousColors(input) {
  let colors = [input];
  let spreadAngle = Math.PI / 5;
  colors.push(rotateColor(input, spreadAngle));
  colors.push(rotateColor(input, -spreadAngle));
  return colors;
}

function getMonochromaticColors(input) {
  let inputVector = vectorFromColorString(input);
  let colors = [input];
  for (let i = 0; i < 3; i++) {
    inputVector = inputVector.multiplyConstant(0.8);
    colors.push(vectorToColor(inputVector));
  }
  return colors;
}

function getSplitComplimentaryColors(input) {
  let colors = [input];
  let spreadAngle = Math.PI / 12;
  colors.push(rotateColor(input, Math.PI + spreadAngle));
  colors.push(rotateColor(input, Math.PI - spreadAngle));
  return colors;
}

function getTriadicColors(input) {
  let colors = [input];
  let spreadAngle = (2 * Math.PI) / 3;
  colors.push(rotateColor(input, spreadAngle));
  colors.push(rotateColor(input, -spreadAngle));
  return colors;
}

function getSquareColors(input) {
  let colors = [input];
  let spreadAngle = Math.PI / 2;
  colors.push(rotateColor(input, spreadAngle));
  colors.push(rotateColor(input, 2 * spreadAngle));
  colors.push(rotateColor(input, 3 * spreadAngle));
  return colors;
}

const schemeConfigs = [
  { name: "Complimentary", func: getComplimentaryColors },
  { name: "Analogous", func: getAnalogousColors },
  { name: "Monochromatic", func: getMonochromaticColors },
  { name: "Split", func: getSplitComplimentaryColors },
  { name: "Triadic", func: getTriadicColors },
  { name: "Square", func: getSquareColors },
];
let schemeGroupsContainer = null;
const schemeSquaresMap = {};
let baseColor = "#ff0000";

function recalculateColors() {
  if (!schemeGroupsContainer) {
    schemeGroupsContainer = document.getElementById("schemeGroups");
    schemeConfigs.forEach((cfg) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "scheme-group";
      const label = document.createElement("div");
      label.className = "scheme-label";
      label.textContent = cfg.name;
      groupDiv.appendChild(label);
      const squaresDiv = document.createElement("div");
      squaresDiv.className = "scheme-squares";
      const squares = [];
      const colorsCount = 4;
      for (let i = 0; i < colorsCount; i++) {
        const div = document.createElement("div");
        div.className = "scheme-color";
        squaresDiv.appendChild(div);
        squares.push(div);
      }
      groupDiv.appendChild(squaresDiv);
      schemeGroupsContainer.appendChild(groupDiv);
      schemeSquaresMap[cfg.name] = squares;
    });
  }

  schemeConfigs.forEach((cfg) => {
    const colors = cfg.func(baseColor);
    const squares = schemeSquaresMap[cfg.name];
    squares.forEach((sq, idx) => {
      if (idx < colors.length) {
        const color = colors[idx];
        sq.style.backgroundColor = color;
        sq.textContent = color.toUpperCase();
        sq.style.display = "";
      } else {
        sq.style.display = "none";
      }
    });
  });
}
