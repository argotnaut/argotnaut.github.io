class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Adds this vector to another and returns a new Vector.
   * @param {Vector} other
   * @returns {Vector}
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /**
   * Multiplies this vector by a constant and returns a new Vector.
   * @param {Vector} other
   * @returns {Vector}
   */
  multiplyConstant(c) {
    return new Vector(this.x * c, this.y * c, this.z * c);
  }

  /**
   * Returns the dot product of this vector with another.
   * @param {Vector} other
   * @returns {number}
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * Returns the cross product of this vector with another.
   * @param {Vector} other
   * @returns {Vector}
   */
  cross(other) {
    const x = this.y * other.z - this.z * other.y;
    const y = this.z * other.x - this.x * other.z;
    const z = this.x * other.y - this.y * other.x;
    return new Vector(x, y, z);
  }

  /**
   * Returns the magnitude (length) of the vector.
   * @returns {number}
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Returns the normalized vector.
   * @returns {Vector}
   */
  normalized() {
    return this.multiplyConstant(1/this.magnitude())
  }

  /**
   * Returns the vector rotated by an angle theta (in radians) around
   * the given vector.
   * see https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula#Statement
   * @param {number}: theta - the angle (in radians) by which to rotate this vector around the given axis
   * @param {Vector}: axis - the vector to use as an axis of rotation when rotating this vector
   * @returns {Vector}
   */
  rotateAroundVector(theta, axis) {
    axis = axis.normalized()
    return this.multiplyConstant(Math.cos(theta)).add(
      axis.cross(this).multiplyConstant(Math.sin(theta))
    ).add(
      axis.multiplyConstant(axis.dot(this)).multiplyConstant(1 - Math.cos(theta))
    )
  }
  
  /**
   * Transforms the vector by a 3x3 matrix.
   * @param {number[][]} matrix - 3x3 array of numbers.
   * @returns {Vector}
   */
  transform(matrix) {
    const x = matrix[0][0] * this.x + matrix[0][1] * this.y + matrix[0][2] * this.z;
    const y = matrix[1][0] * this.x + matrix[1][1] * this.y + matrix[1][2] * this.z;
    const z = matrix[2][0] * this.x + matrix[2][1] * this.y + matrix[2][2] * this.z;
    return new Vector(x, y, z);
  }
}

// 2D Matrix class
class Matrix2D {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  static fromArray(arr) {
    return new Matrix2D(arr[0][0], arr[0][1], arr[1][0], arr[1][1]);
  }

  static identity() {
    return new Matrix2D(
      1, 0,
      0, 1
    );
  }

  toArray() {
    return [
      [this.a, this.b],
      [this.c, this.d],
    ];
  }

  determinant() {
    return this.a * this.d - this.b * this.c;
  }

  multiply(other) {
    if (other instanceof Matrix2D) {
      const m00 = this.a * other.a + this.b * other.c;
      const m01 = this.a * other.b + this.b * other.d;
      const m10 = this.c * other.a + this.d * other.c;
      const m11 = this.c * other.b + this.d * other.d;
      return new Matrix2D(m00, m01, m10, m11);
    }
    const arr = this.toArray();
    const out = multiply(arr, other);
    return Matrix2D.fromArray(out);
  }

  multiplyConstant(c) {
    return new Matrix2D(this.a * c, this.b * c, this.c * c, this.d * c);
  }

  getInverse() {
    m = new Matrix2D(this.d, -this.b, -this.c, this.a)
    coeff = 1 / (this.a*this.d - this.b*this.c)
    return m.multiplyConstant(coeff)
  }
}

// 3D Matrix class
class Matrix3D {
  constructor(
    a00, a01, a02,
    a10, a11, a12,
    a20, a21, a22
  ) {
    this.m = [
      [a00, a01, a02],
      [a10, a11, a12],
      [a20, a21, a22],
    ];
  }

  static fromArray(arr) {
    return new Matrix3D(
      arr[0][0], arr[0][1], arr[0][2],
      arr[1][0], arr[1][1], arr[1][2],
      arr[2][0], arr[2][1], arr[2][2]
    );
  }

  static identity() {
    return new Matrix3D(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );
  }

  /**
   * Returns a rotation matrix that rotates points by the given
   * angles (in radians) around the x, y, and z axes, respectively
   * @param {number} x: the number of radians by which to rotate around the x-axis
   * @param {number} y: the number of radians by which to rotate around the y-axis
   * @param {number} z: the number of radians by which to rotate around the z-axis
   * @returns {Matrix3D}
   */
  static rotationMatrix(x, y, z) {
    const cosX = Math.cos(x), cosY = Math.cos(y), cosZ = Math.cos(z);
    const sinX = Math.sin(x), sinY = Math.sin(y), sinZ = Math.sin(z);
    // see https://en.wikipedia.org/wiki/Rotation_matrix#General_3D_rotations
    return new Matrix3D(
      cosZ*cosY, cosZ*sinY*sinX - sinZ*cosX, cosZ*sinY*cosX+sinZ*sinX,
      sinZ*cosY, sinZ*sinY*sinX+cosZ*cosX, sinZ*sinY*cosX-cosZ*sinX,
      -sinY, cosY*sinX, cosY*cosX
    );
  }

  toArray() {
    return this.m;
  }

  determinant() {
    const m = this.m;
    const a = m[0][0], b = m[0][1], c = m[0][2];
    const d = m[1][0], e = m[1][1], f = m[1][2];
    const g = m[2][0], h = m[2][1], i = m[2][2];
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }

  multiply(other) {
    if (other instanceof Matrix3D) {
      const A = this.m;
      const B = other.m;
      const out = new Array(3);
      for (let r = 0; r < 3; r++) {
        out[r] = new Array(3).fill(0);
        for (let c = 0; c < 3; c++) {
          for (let k = 0; k < 3; k++) {
            out[r][c] += A[r][k] * B[k][c];
          }
        }
      }
      return Matrix3D.fromArray(out);
    }
    const arr = this.toArray();
    const out = multiply(arr, other);
    return Matrix3D.fromArray(out);
  }

  multiplyConstant(x) {
    return new Matrix3D(
      x * this.m[0][0], x * this.m[0][1], x * this.m[0][2],
      x * this.m[1][0], x * this.m[1][1], x * this.m[1][2],
      x * this.m[2][0], x * this.m[2][1], x * this.m[2][2]
    );
  }

  getTranspose() {
    let output = Matrix3D.identity()
    for (let row = 0; row < this.m.length; row++) {
      for (let col = 0; col < this.m[row].length; col++) {
        output.m[row][col] = this.m[col][row]
      }
    }
    return output
  }

  getInverse() {
    let m = this.m
    /*
      Step 1: calculating the Matrix of Minors,
    */
    let minors = Matrix3D.identity() // This will hold the detirminants of minors
    for (let row = 0; row < m.length; row++) {
      for (let col = 0; col < m[row].length; col++) {
        const element = m[row][col];
        let minorCells = new Array()
        // find all the cells that aren't in element's row/col, and use them to construct the minor matrix
        for (let cellRow = 0; cellRow < m.length; cellRow++) {
          for (let cellCol = 0; cellCol < m[cellRow].length; cellCol++) {
            if (cellRow != row && cellCol != col) {
              minorCells.push(m[cellRow][cellCol])
            }
          }
        }
        // construct the minor matrix
        let minorMatrix = new Matrix2D(...minorCells)
        minors.m[row][col] = minorMatrix.determinant()
      }
    }
    /*
      Step 2: then turn that into the Matrix of Cofactors,
    */
    let cofactors = minors
    let sign = 1 // this represents whether the current term should be positive or negative
    for (let row = 0; row < m.length; row++) {
      for (let col = 0; col < m[row].length; col++) {
        cofactors.m[row][col] = cofactors.m[row][col] * sign
        sign *= -1
      }
    }
    /*
      Step 3: then the Adjugate
    */
    const adjugate = cofactors.getTranspose() // because this is a real vector space, the adjugate is the transpose
    /*
      Step 4: multiply the adjugate by 1 / det(original)
    */
    const originalDet = m[0][0]*minors.m[0][0] - m[0][1]*minors.m[0][1] + m[0][2]*minors.m[0][2]
    return adjugate.multiplyConstant(1/originalDet)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("colorInput");
  const preview = document.getElementById("preview");
  schemeSelect = document.getElementById('schemeSelect');
  if (schemeSelect) {
    schemeSelect.addEventListener('change', () => {
      recalculateColors();
    });
  }

  function update() {
    const val = input.value;
    preview.style.backgroundColor = val;
    preview.textContent = val.toUpperCase();
    baseColor = val.toUpperCase();
    recalculateColors();
  }

  input.addEventListener("input", update);
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
  let output = Matrix3D.identity()
  return output.multiply(
    Matrix3D.rotationMatrix(Math.PI/4, 0, Math.PI/4)
  )
}

/**
 * Returns a transform matrix for rotating a vector by a given
 * angle in radians around the longest diagonal of the color cube
 * @returns {Matrix3D}
 */
function rotateVectorAroundDiagonal(theta) {
  const colorSpaceRotationSet = getColorSpaceRotationBasisSet()
  return colorSpaceRotationSet.getInverse().multiply(
    /*
    getColorSpaceRotationBasisSet creates a basis set where the color
    cube's diagonal is the z basis vector, hence rotating the vector around
    the z-axis by theta radians here
    */
    Matrix3D.rotationMatrix(0, 0, theta)
  ).multiply(
    colorSpaceRotationSet
  )
}

function multiply(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array(aNumRows); // initialize array of rows
  var output = new Array(aNumRows)
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

function vectorToColor(input) {
  function toPaddedHex(n) {
    n = Math.max(0, Math.min(Math.round(n),255))
    return (n < 16) ? "0" + n.toString(16) : n.toString(16);
  }
  return "#"+
    toPaddedHex(input.x)+
    toPaddedHex(input.y)+
    toPaddedHex(input.z)
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
  let inputVector = vectorFromColorString(input)
  const diagVector = new Vector(1, 1, 1)

  let rotatedColorVector = inputVector.rotateAroundVector(theta, diagVector)
  rotatedColorVector = new Vector(
    Math.min(255, rotatedColorVector.x),
    Math.min(255, rotatedColorVector.y),
    Math.min(255, rotatedColorVector.z),
  )
  return vectorToColor(rotatedColorVector)
}

function getComplimentaryColors(input) {
  let colors = [input]
  colors.push(rotateColor(input, Math.PI))
  return colors
}

function getAnalogousColors(input) {
  let colors = [input]
  let spreadAngle = Math.PI / 5
  colors.push(rotateColor(input, spreadAngle))
  colors.push(rotateColor(input, -spreadAngle))
  return colors
}

function getMonochromaticColors(input) {
  let inputVector = vectorFromColorString(input)
  let colors = [input]
  for (let i = 0; i < 3; i++) {
    inputVector = inputVector.multiplyConstant(0.8)
    colors.push(vectorToColor(inputVector))
  }
  return colors
}

function getSplitComplimentaryColors(input) {
  let colors = [input]
  let spreadAngle = Math.PI / 6
  colors.push(rotateColor(input, Math.PI + spreadAngle))
  colors.push(rotateColor(input, Math.PI - spreadAngle))
  return colors
}

function getTriadicColors(input) {
  let colors = [input]
  let spreadAngle = 2*Math.PI / 3
  colors.push(rotateColor(input, spreadAngle))
  colors.push(rotateColor(input, -spreadAngle))
  return colors
}

function getSquareColors(input) {
  let colors = [input]
  let spreadAngle = Math.PI / 2
  colors.push(rotateColor(input, spreadAngle))
  colors.push(rotateColor(input, 2*spreadAngle))
  colors.push(rotateColor(input, 3*spreadAngle))
  return colors
}

// Global variables for scheme squares
let schemeColorsContainer = null;
let squares = [];
let schemeSelect = null;
let baseColor = '#ff0000';

// Create scheme color squares and update on selection
function recalculateColors() {
  if (!schemeColorsContainer) {
    schemeColorsContainer = document.getElementById('schemeColors');
    const numSquares = 4;
    for (let i = 0; i < numSquares; i++) {
      const div = document.createElement('div');
      div.className = 'scheme-color';
      schemeColorsContainer.appendChild(div);
      squares.push(div);
    }
  }

  function updateSchemeColors() {
    const scheme = schemeSelect ? schemeSelect.value : 'complimentary';
    let colors;
    switch (scheme) {
      case 'complimentary':
        colors = getComplimentaryColors(baseColor);
        break;
      case 'analogous':
        colors = getAnalogousColors(baseColor);
        break;
      case 'monochromatic':
        colors = getMonochromaticColors(baseColor);
        break;
      case 'split':
        colors = getSplitComplimentaryColors(baseColor);
        break;
      case 'triadic':
        colors = getTriadicColors(baseColor);
        break;
      case 'square':
        colors = getSquareColors(baseColor);
        break;
      default:
        colors = [baseColor];
    }
    for (let i = 0; i < squares.length; i++) {
      const color = colors[i] || '#000000';
      squares[i].style.backgroundColor = color;
      squares[i].textContent = color.toUpperCase();
    }
  }

  // Initial update
  updateSchemeColors();
}

