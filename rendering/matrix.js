// NDMatrix: N-dimensional matrix class

// Helper function to multiply two 2D arrays
function multiply(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    out = new Array(aNumRows);
  for (var r = 0; r < aNumRows; ++r) {
    out[r] = new Array(bNumCols);
    for (var c = 0; c < bNumCols; ++c) {
      out[r][c] = 0;
      for (var i = 0; i < aNumCols; ++i) {
        out[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return out;
}

class NDMatrix {
  constructor(arr) {
    this.m = arr;
  }

  static fromArray(arr) {
    return new NDMatrix(arr);
  }

  static identity(n) {
    const m = [];
    for (let i = 0; i < n; i++) {
      const row = new Array(n).fill(0);
      row[i] = 1;
      m.push(row);
    }
    return new NDMatrix(m);
  }

  static rotationMatrix(x, y, z) {
    const cosX = Math.cos(x), cosY = Math.cos(y), cosZ = Math.cos(z);
    const sinX = Math.sin(x), sinY = Math.sin(y), sinZ = Math.sin(z);
    return new NDMatrix([
      [cosZ*cosY, cosZ*sinY*sinX - sinZ*cosX, cosZ*sinY*cosX+sinZ*sinX],
      [sinZ*cosY, sinZ*sinY*sinX+cosZ*cosX, sinZ*sinY*cosX-cosZ*sinX],
      [-sinY, cosY*sinX, cosY*cosX]
    ]);
  }

  toArray() {
    return this.m;
  }

  determinant() {
    const n = this.m.length;
    if (n === 1) return this.m[0][0];
    if (n === 2) {
      const a = this.m[0][0], b = this.m[0][1];
      const c = this.m[1][0], d = this.m[1][1];
      return a * d - b * c;
    }
    let det = 0;
    for (let j = 0; j < n; j++) {
      const sign = (j % 2 === 0) ? 1 : -1;
      const minor = this._minor(0, j);
      det += sign * this.m[0][j] * new NDMatrix(minor).determinant();
    }
    return det;
  }

  _minor(row, col) {
    const minor = [];
    for (let r = 0; r < this.m.length; r++) {
      if (r === row) continue;
      const newRow = [];
      for (let c = 0; c < this.m[r].length; c++) {
        if (c === col) continue;
        newRow.push(this.m[r][c]);
      }
      minor.push(newRow);
    }
    return minor;
  }

  multiply(other) {
    if (other instanceof NDMatrix) {
      const out = multiply(this.m, other.m);
      return NDMatrix.fromArray(out);
    }
    // Assume other is a 2D array
    const out = multiply(this.m, other);
    return NDMatrix.fromArray(out);
  }

  multiplyConstant(c) {
    const out = this.m.map(row => row.map(val => val * c));
    return new NDMatrix(out);
  }

  getTranspose() {
    const n = this.m.length;
    const m = this.m;
    const transposed = NDMatrix.identity(n);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        transposed.m[r][c] = m[c][r];
      }
    }
    return transposed;
  }

  getInverse() {
    const n = this.m.length;
    const det = this.determinant();
    if (det === 0) throw new Error('Matrix is singular');
    // Compute matrix of cofactors
    const cofactors = [];
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        const minor = this._minor(r, c);
        const minorDet = new NDMatrix(minor).determinant();
        const sign = ((r + c) % 2 === 0) ? 1 : -1;
        row.push(sign * minorDet);
      }
      cofactors.push(row);
    }
    const cofactorMatrix = new NDMatrix(cofactors);
    const adjugate = cofactorMatrix.getTranspose();
    return adjugate.multiplyConstant(1 / det);
  }
}

// Export for browser
window.NDMatrix = NDMatrix;
