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