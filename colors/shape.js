const normalScale = 40;

class Face {
  constructor(vertexCoordinates) {
    if (vertexCoordinates.length < 3)
      throw new Error("Not enough points to define a face");
    this.vertexCoordinates = vertexCoordinates;
  }

  getCentroid() {
    // https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points
    return this.vertexCoordinates.reduce((p0, p1) => p0.add(p1)).multiplyConstant(
      1 / this.vertexCoordinates.length,
    );
  }

  getNormal(scaleFactor = 1) {
    const p1 = this.vertexCoordinates[0];
    const pCommon = this.vertexCoordinates[1];
    const p2 = this.vertexCoordinates[2];
    const centroid = this.getCentroid();
    let vec1 = p1.subtract(pCommon);
    let vec2 = p2.subtract(pCommon);
    let crossProduct = vec1.cross(vec2).normalized().multiplyConstant(
      -scaleFactor, // Makes the normal visible when drawn
    );
    return crossProduct.add(centroid);
  }
}

class Shape {
  constructor(
    vertices,
    faces,
    rotationMatrix = Camera.defaultRotationMatrix,
    translationVector = new Vector(0, 0, 0),
  ) {
    this.vertices = vertices;
    this.faces = faces;
    this.rotationMatrix = rotationMatrix;
    this.translationVector = translationVector;
  }

  getFaceVerticesFromList(vertices) {
    let outputFaces = [];
    this.faces.forEach((face) => {
      let verticesForFace = [];
      face.forEach((vertexIdx) => {
        verticesForFace.push(vertices[vertexIdx]);
      });
      outputFaces.push(verticesForFace);
    });
    return outputFaces;
  }

  static drawLineOnCanvas(context, x0, y0, x1, y1, color = "#000") {
    const radius = 5;
    context.beginPath();
    context.moveTo(x0 + targetCanvas.width / 2, y0 + targetCanvas.height / 2);
    context.lineTo(x1 + targetCanvas.width / 2, y1 + targetCanvas.height / 2);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }

  static drawPointOnCanvas(ctx, x, y, color = "#000") {
    const radius = 5;
    ctx.beginPath();
    ctx.arc(
      x + targetCanvas.width / 2,
      y + targetCanvas.height / 2,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
  }

  getVertices() {
    let rotatedVertices = [];
    this.vertices.forEach((vertex) => {
      let rotatedVertex = this.rotationMatrix.multiply(
        new NDMatrix([[vertex.x], [vertex.y], [vertex.z]]),
      );
      rotatedVertices.push(
        new Vector(
          rotatedVertex.m[0][0],
          rotatedVertex.m[1][0],
          rotatedVertex.m[2][0],
        ),
      );
    });
    return rotatedVertices;
  }

  getFaces() {
    let output = [];
    this.faces.forEach((face) => {
      let faceVertices = [];
      let oldVertices = this.getVertices();
      face.forEach((vertexIdx) => faceVertices.push(oldVertices[vertexIdx]));
      output.push(new Face(faceVertices));
    });
    return output;
  }

  render(canvas, context, camera) {
    const projectedVertices = [];

    this.getVertices().forEach((vertex) => {
      const point = camera.projectOntoCameraPlane(vertex);
      projectedVertices.push(point);
    });

    // Draw vertices
    projectedVertices.forEach((vertex) => {
      Shape.drawPointOnCanvas(context, vertex.x, vertex.y);
    });

    const cameraScalingMatrix = camera.getScalingMatrix();
    const principalVector = new Vector(
      cameraScalingMatrix.m[0][2],
      cameraScalingMatrix.m[1][2],
      cameraScalingMatrix.m[2][2],
    );
    const scaledPrincipalVectorMatrix = cameraScalingMatrix
      .getInverse()
      .multiply(
        new NDMatrix([
          [0],
          [0],
          [1], // Assuming the principal axis is +z
        ]),
      );
    const scaledPrincipalVector = new Vector(
      scaledPrincipalVectorMatrix.m[0][0],
      scaledPrincipalVectorMatrix.m[1][0],
      scaledPrincipalVectorMatrix.m[2][0],
    );

    // Draw centroids
    this.getFaces().forEach((face) => {
      const normalStart = camera.projectOntoCameraPlane(
        face.getCentroid(),
      );
      const normalVector = face.getNormal(normalScale);
      const normalEnd = camera.projectOntoCameraPlane(normalVector);
      if (principalVector.dot(normalVector) > 0) {
        Shape.drawLineOnCanvas(
          context,
          normalStart.x,
          normalStart.y,
          normalEnd.x,
          normalEnd.y,
          "#00FF00",
        );
      }
      Shape.drawPointOnCanvas(
        context,
        normalStart.x,
        normalStart.y,
        "#FF0000",
      );
    });
  }
}