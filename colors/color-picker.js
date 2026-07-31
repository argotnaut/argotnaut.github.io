/**
 * Returns a matrix whose colums comprise a basis set for the vector
 * space where the z-axis is the longest diagonal across the color
 * cube (i.e. the space where <r=1, g=1, b=1> in the color space
 * corresponds to <0, 0, 1>)
 * @returns {NDMatrix}
 */
function getColorSpaceRotationBasisSet() {
  let output = NDMatrix.identity(3);
  return output.multiply(NDMatrix.rotationMatrix(Math.PI / 4, 0, Math.PI / 4));
}

/**
 * Returns a transform matrix for rotating a vector by a given
 * angle in radians around the longest diagonal of the color cube
 * @returns {NDMatrix}
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
      NDMatrix.rotationMatrix(0, 0, theta),
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

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l * 255;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3) * 255;
    g = hue2rgb(p, q, h) * 255;
    b = hue2rgb(p, q, h - 1 / 3) * 255;
  }
  return { r, g, b };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return (
    "#" +
    toHex(r).toUpperCase() +
    toHex(g).toUpperCase() +
    toHex(b).toUpperCase()
  );
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

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("colorInput");
  const preview = document.getElementById("preview");

  function update() {
    const val = input.value;
    preview.style.backgroundColor = val;
    preview.textContent = val.toUpperCase();
    baseColor = val.toUpperCase();
    recalculateColors();
    updateCursorFromBaseColor();
  }

  input.addEventListener("input", update);
  // create color wheel
  const wheelDiv = document.getElementById("color-wheel");
  const wheelCanvas = document.createElement("canvas");
  wheelCanvas.width = 200;
  wheelCanvas.height = 200;
  wheelDiv.appendChild(wheelCanvas);

  const width = wheelCanvas.width;
  const height = wheelCanvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = (Math.min(width, height) / 2) * 0.9;
  const innerRadius = outerRadius * 0.6;
  const ringRadius = (outerRadius + innerRadius) / 2;
  const cursorRadius = 6;
  let cursorAngle = 0;
  let dragging = false;

  function drawWheelAndCursor() {
    const ctx = wheelCanvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    drawColorWheel(wheelCanvas);
    const x = cx + ringRadius * Math.cos(cursorAngle);
    const y = cy + ringRadius * Math.sin(cursorAngle);
    // line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    // cursor
    ctx.beginPath();
    ctx.arc(x, y, cursorRadius, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    // Draw dependent cursors for selected color scheme
    if (selectedSchemeColors && selectedSchemeColors.length > 1) {
      selectedSchemeColors.forEach((color) => {
        if (color.toUpperCase() === baseColor) return;
        const rgbC = hexToRgb(color);
        const hslC = rgbToHsl(rgbC.r, rgbC.g, rgbC.b);
        const angleC = (hslC.h * Math.PI) / 180;
        const xC = cx + ringRadius * Math.cos(angleC);
        const yC = cy + ringRadius * Math.sin(angleC);
        // line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(xC, yC);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(xC, yC, cursorRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      });
    }
  }
  window.drawWheelAndCursor = drawWheelAndCursor;

  function updateCursorFromBaseColor() {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    cursorAngle = (hsl.h * Math.PI) / 180;
    if (selectedSchemeName) {
      const schemeCfg = schemeConfigs.find(
        (c) => c.name === selectedSchemeName,
      );
      selectedSchemeColors = schemeCfg.func(baseColor);
    } else {
      selectedSchemeColors = null;
    }
    drawWheelAndCursor();
  }

  function updateCursorAngleFromMouse(e) {
    const rect = wheelCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const angle = Math.atan2(my - cy, mx - cx);
    cursorAngle = angle;
    const oldBaseColorAsRGB = hexToRgb(baseColor);
    const oldBaseColorAsHSL = rgbToHsl(
      oldBaseColorAsRGB.r,
      oldBaseColorAsRGB.g,
      oldBaseColorAsRGB.b,
    );
    const hue = ((angle * 180) / Math.PI + 360) % 360;
    const newBaseColorAsHSL = {
      h: hue,
      s: oldBaseColorAsHSL.s,
      l: oldBaseColorAsHSL.l,
    };
    const newBaseColorAsRGB = hslToRgb(
      newBaseColorAsHSL.h,
      newBaseColorAsHSL.s,
      newBaseColorAsHSL.l,
    );
    baseColor = rgbToHex(
      newBaseColorAsRGB.r,
      newBaseColorAsRGB.g,
      newBaseColorAsRGB.b,
    );
    preview.style.backgroundColor = baseColor;
    preview.textContent = baseColor;
    input.value = baseColor;
    recalculateColors();
    updateCursorFromBaseColor();
  }

  wheelCanvas.addEventListener("mousedown", (e) => {
    dragging = true;
    updateCursorAngleFromMouse(e);
  });
  wheelCanvas.addEventListener("mousemove", (e) => {
    if (dragging) updateCursorAngleFromMouse(e);
  });
  wheelCanvas.addEventListener("mouseup", () => {
    dragging = false;
  });
  wheelCanvas.addEventListener("mouseleave", () => {
    dragging = false;
  });

  // init cursor based on baseColor
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  cursorAngle = (hsl.h * Math.PI) / 180;
  drawWheelAndCursor();
  update();
});

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
let selectedSchemeDiv = null;
let selectedSchemeName = null;
let selectedSchemeColors = null;

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
      groupDiv.addEventListener("click", () => {
        if (selectedSchemeDiv === groupDiv) {
          groupDiv.classList.remove("selected");
          selectedSchemeDiv = null;
          selectedSchemeName = null;
          selectedSchemeColors = null;
        } else {
          if (selectedSchemeDiv) {
            selectedSchemeDiv.classList.remove("selected");
          }
          groupDiv.classList.add("selected");
          selectedSchemeDiv = groupDiv;
          selectedSchemeName = cfg.name;
          selectedSchemeColors = cfg.func(baseColor);
        }
        // Redraw wheel with dependent cursors
        window.drawWheelAndCursor();
      });
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
