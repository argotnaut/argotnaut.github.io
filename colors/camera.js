class Camera {
  static defaultRotationMatrix = new NDMatrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  constructor(
    focalLength = 5,
    principalX = 0,
    principalY = 0,
    skew = 1,
    mx = 1,
    my = 1,
    rotationMatrix = Camera.defaultRotationMatrix,
    translationVector = new Vector(50, 0, 0),
  ) {
    this.focalLength = focalLength;
    this.principalX = principalX;
    this.principalY = principalY;
    this.skew = skew;
    this.mx = mx;
    this.my = my;
    this.rotationMatrix = rotationMatrix;
    this.translationVector = translationVector;
  }

  getCameraMatrix() {
    const scalingMatrix = this.getScalingMatrix(
      this.focalLength,
      this.mx,
      this.my,
      this.principalX,
      this.principalY,
    );
    const f = this.focalLength;
    const focalMatrix = new NDMatrix([
      [f, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, 1, 0],
    ]);
    const tx = this.translationVector.x;
    const ty = this.translationVector.y;
    const tz = this.translationVector.z;
    const r = this.rotationMatrix.m;
    const extrinsicParameters = new NDMatrix([
      [r[0][0], r[0][1], r[0][2], tx],
      [r[1][0], r[1][1], r[1][2], ty],
      [r[2][0], r[2][1], r[2][2], tz],
      [0, 0, 0, 1],
    ]);
    return scalingMatrix
      .multiply(focalMatrix)
      .multiply(extrinsicParameters.getInverse());
  }

  getScalingMatrix() {
    const u = this.principalX;
    const v = this.principalY;
    const ax = this.focalLength / this.mx;
    const ay = this.focalLength / this.my;
    return new NDMatrix([
      [ax, 0, u],
      [0, ay, v],
      [0, 0, 1],
    ]);
  }

  projectOntoCameraPlane(inputVector) {
    const outputMatrix = this.getCameraMatrix().multiply(
      new NDMatrix([[inputVector.x], [inputVector.y], [inputVector.z], [1]]),
    );
    const output3Vector = [
      outputMatrix.m[0][0],
      outputMatrix.m[1][0],
      outputMatrix.m[2][0],
    ];
    return new Vector(
      output3Vector[0] / output3Vector[2],
      output3Vector[1] / output3Vector[2],
      0,
    );
  }
}