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