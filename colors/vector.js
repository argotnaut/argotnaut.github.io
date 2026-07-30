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
   * Subtracts a vector from this one and returns a new Vector.
   * @param {Vector} other
   * @returns {Vector}
   */
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
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
    return this.multiplyConstant(1 / this.magnitude());
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
    axis = axis.normalized();
    return this.multiplyConstant(Math.cos(theta))
      .add(axis.cross(this).multiplyConstant(Math.sin(theta)))
      .add(
        axis
          .multiplyConstant(axis.dot(this))
          .multiplyConstant(1 - Math.cos(theta)),
      );
  }

  /**
   * Transforms the vector by a 3x3 matrix.
   * @param {number[][]} matrix - 3x3 array of numbers.
   * @returns {Vector}
   */
  transform(matrix) {
    const x =
      matrix[0][0] * this.x + matrix[0][1] * this.y + matrix[0][2] * this.z;
    const y =
      matrix[1][0] * this.x + matrix[1][1] * this.y + matrix[1][2] * this.z;
    const z =
      matrix[2][0] * this.x + matrix[2][1] * this.y + matrix[2][2] * this.z;
    return new Vector(x, y, z);
  }
}
