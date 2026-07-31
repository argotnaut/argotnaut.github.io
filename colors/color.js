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