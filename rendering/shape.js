const normalScale = 40;

class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  getRenderables() {
    return this;
  }
}

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

  getRenderables() {
    return this;
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

  getVertices() {
    var transformedVertices = [];
    this.vertices.forEach((vertex) => {
      let rotatedVertex = this.rotationMatrix.multiply(
        new NDMatrix([[vertex.x], [vertex.y], [vertex.z]]),
      );
      transformedVertices.push(
        new Vector(
          rotatedVertex.m[0][0] + this.translationVector.x,
          rotatedVertex.m[1][0] + this.translationVector.y,
          rotatedVertex.m[2][0] + this.translationVector.z,
        ),
      );
    });
    return transformedVertices;
  }

  getFaces() {
    var output = [];
    this.faces.forEach((face) => {
      let faceVertices = [];
      let oldVertices = this.getVertices();
      face.forEach((vertexIdx) => faceVertices.push(oldVertices[vertexIdx]));
      output.push(new Face(faceVertices));
    });
    return output;
  }

  getRenderables() {
    return this.getFaces();
  }
}