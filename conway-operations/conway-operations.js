const targetCanvas = document.getElementById("canvas");
const targetCanvasContext = targetCanvas.getContext("2d");

// Global constants for polygon projection
let focalDistance = 5;
let principalX = 0;
let principalY = 0;
let skewCoefficient = 1;
let translationX = 50;
let translationY = 0;
let translationZ = 0;
let selectedShape = "Cube";
let shapeSizeCoefficient = 10;
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

const g = 1.618033988749895;
const Seeds = {
  Tetragon: {
    vertices: [
      new Vector(
        shapeSizeCoefficient,
        shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
      new Vector(
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
    ],
    faces: [
      [0, 2, 1],
      [0, 1, 3],
      [0, 3, 2],
      [1, 2, 3],
    ],
  },
  Cube: {
    vertices: [
      new Vector(
        shapeSizeCoefficient,
        shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        shapeSizeCoefficient,
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
      new Vector(
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
        shapeSizeCoefficient,
      ),
      new Vector(
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
        -shapeSizeCoefficient,
      ),
    ],
    faces: [
      [0, 4, 6, 2],
      [0, 2, 3, 1],
      [0, 1, 5, 4],
      [7, 6, 4, 5],
      [7, 3, 2, 6],
      [7, 5, 1, 3],
    ],
  },
  Octahedron: {
    vertices: [
      new Vector(shapeSizeCoefficient, 0, 0),
      new Vector(-shapeSizeCoefficient, 0, 0),
      new Vector(0, shapeSizeCoefficient, 0),
      new Vector(0, -shapeSizeCoefficient, 0),
      new Vector(0, 0, shapeSizeCoefficient),
      new Vector(0, 0, -shapeSizeCoefficient),
    ],
    faces: [
      [0, 2, 4],
      [0, 4, 3],
      [0, 3, 5],
      [0, 5, 2],
      [1, 4, 2],
      [1, 3, 4],
      [1, 5, 3],
      [1, 2, 5],
    ],
  },
  Icosahedron: {
    vertices: [
      new Vector(0, shapeSizeCoefficient, g * shapeSizeCoefficient),
      new Vector(0, -shapeSizeCoefficient, g * shapeSizeCoefficient),
      new Vector(0, shapeSizeCoefficient, -g * shapeSizeCoefficient),
      new Vector(0, -shapeSizeCoefficient, -g * shapeSizeCoefficient),
      new Vector(shapeSizeCoefficient, g * shapeSizeCoefficient, 0),
      new Vector(-shapeSizeCoefficient, g * shapeSizeCoefficient, 0),
      new Vector(shapeSizeCoefficient, -g * shapeSizeCoefficient, 0),
      new Vector(-shapeSizeCoefficient, -g * shapeSizeCoefficient, 0),
      new Vector(g * shapeSizeCoefficient, 0, shapeSizeCoefficient),
      new Vector(-g * shapeSizeCoefficient, 0, shapeSizeCoefficient),
      new Vector(g * shapeSizeCoefficient, 0, -shapeSizeCoefficient),
      new Vector(-g * shapeSizeCoefficient, 0, -shapeSizeCoefficient),
    ],
    faces: [
      [0, 1, 8],
      [0, 8, 4],
      [0, 4, 5],
      [0, 5, 9],
      [0, 9, 1],
      [3, 10, 6],
      [3, 2, 10],
      [3, 11, 2],
      [3, 7, 11],
      [3, 6, 7],
      [1, 6, 8],
      [8, 10, 4],
      [4, 2, 5],
      [5, 11, 9],
      [9, 7, 1],
      [6, 10, 8],
      [10, 2, 4],
      [2, 11, 5],
      [11, 7, 9],
      [7, 6, 1],
    ],
  },
};

const defaultRotationMatrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function getCameraMatrix(
  focalLength,
  mx = 1, // width of a pixel on the projection plane
  my = 1, // height of a pixel on the projection plane
  principalX = 0, // x coordinate of the principle point (center of view in camera plane)
  principalY = 0, // y coordinate of the principle point (center of view in camera plane)
  skew = 1, // skew coefficient between x and y axis of camera plane
  rotationMatrix = defaultRotationMatrix, // the matrix that describes the camera's rotation in world coordinates
  translationVector = new Vector(0, 0, 0), // the vector that describes the camera's translation in world coordinates
) {
  const u = principalX;
  const v = principalY;
  const ax = focalLength / mx;
  const ay = focalLength / my;
  const scalingMatrix = new NDMatrix([
    [ax, 0, u],
    [0, ay, v],
    [0, 0, 1],
  ]);
  const f = focalLength;
  const focalMatrix = new NDMatrix([
    [f, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, 1, 0],
  ]);
  const tx = translationVector.x;
  const ty = translationVector.y;
  const tz = translationVector.z;
  const r = rotationMatrix;
  const extrinsicParameters = new NDMatrix([
    [r[0][0], r[0][1], r[0][2], tx],
    [r[1][0], r[1][1], r[1][2], ty],
    [r[2][0], r[2][1], r[2][2], tz],
    [0, 0, 0, 1],
  ]);
  // return (scalingMatrix) (focalMatrix) (extrinsicParameters)^-1
  return scalingMatrix
    .multiply(focalMatrix)
    .multiply(extrinsicParameters.getInverse());
}

function projectOntoCameraPlane(
  inputVector, // the vector being projected onto the camera plane
  focalLength,
  mx = 1, // width of a pixel on the projection plane
  my = 1, // height of a pixel on the projection plane
  principalX = 0, // x coordinate of the principle point (center of view in camera plane)
  principalY = 0, // y coordinate of the principle point (center of view in camera plane)
  skew = 1, // skew coefficient between x and y axis of camera plane
  rotationMatrix = defaultRotationMatrix, // the matrix that describes the camera's rotation in world coordinates
  translationVector = new Vector(0, 0, 0), // the vector that describes the camera's translation in world coordinates
) {
  const outputMatrix = getCameraMatrix(
    focalLength,
    mx,
    my,
    principalX,
    principalY,
    skew,
    rotationMatrix,
    translationVector,
  ).multiply(
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
    0, // This value is ignored when rendering on the 2D canvas
  );
}

function drawPointOnCanvas(ctx, x, y) {
  const radius = 5;
  ctx.beginPath();
  ctx.arc(
    x + targetCanvas.width / 2,
    y + targetCanvas.height / 2,
    radius,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#000";
  ctx.fill();
}

function showPolygon() {
  const outputVertices = [];
  const shape = Seeds[selectedShape];
  if (!shape) return;
  const shapeRotation = NDMatrix.rotationMatrix(
    rotationX,
    rotationY,
    rotationZ
  );
  shape.vertices.forEach((vertex) => {
    let rotatedVertex = shapeRotation.multiply(
      new NDMatrix([[vertex.x], [vertex.y], [vertex.z]]),
    );
    let rotatedVertexVector = new Vector(
      rotatedVertex.m[0][0],
      rotatedVertex.m[1][0],
      rotatedVertex.m[2][0],
    );
    const point = projectOntoCameraPlane(
      rotatedVertexVector,
      focalDistance,
      1,
      1,
      principalX,
      principalY,
      skewCoefficient,
      defaultRotationMatrix,
      new Vector(translationX, translationY, translationZ),
    );
    outputVertices.push(point);
  });
  const ctx = targetCanvas.getContext("2d");
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  outputVertices.forEach((vertex) => {
    drawPointOnCanvas(ctx, vertex.x, vertex.y);
  });
}

function resizeCanvas() {
  targetCanvas.style.background = "#c7ceea";
  targetCanvas.width = window.innerWidth;
  targetCanvas.height = window.innerHeight;

  showPolygon();
}

// Drag handling
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startTranslationX = 0;
let startTranslationY = 0;
let startTranslationZ = 0;
let startRotationX = 0;
let startRotationY = 0;
let startRotationZ = 0;
let dragMode = "camera"; // or "shape"

function onMouseDown(e) {
  e.preventDefault();
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  const cameraOpen = document.getElementById("camera-controls").open;
  const shapeOpen = document.getElementById("shape-controls").open;
  if (shapeOpen) {
    dragMode = "shape";
    startRotationX = rotationX;
    startRotationY = rotationY;
    startRotationZ = rotationZ;
  } else if (cameraOpen) {
    dragMode = "camera";
    startTranslationX = translationX;
    startTranslationY = translationY;
    startTranslationZ = translationZ;
  } else {
    // Default to camera if none open
    dragMode = "camera";
    startTranslationX = translationX;
    startTranslationY = translationY;
    startTranslationZ = translationZ;
  }
}

function onMouseMove(e) {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const scale = 0.005; // adjust sensitivity
  if (dragMode === "camera") {
    translationX = startTranslationX + dx * scale;
    translationY = startTranslationY + dy * scale;
    if (e.shiftKey) {
      translationZ = startTranslationZ + dy * scale;
    }
    // Update input controls
    document.getElementById("translationX").value = translationX;
    document.getElementById("translationY").value = translationY;
    document.getElementById("translationZ").value = translationZ;
  } else if (dragMode === "shape") {
    rotationX = startRotationX + dy * scale;
    rotationY = startRotationY + dx * scale;
    if (e.shiftKey) {
      rotationZ = startRotationZ + dy * scale;
    }
    // Update input controls
    document.getElementById("rotationX").value = rotationX;
    document.getElementById("rotationY").value = rotationY;
    document.getElementById("rotationZ").value = rotationZ;
  }
  showPolygon();
}

function onMouseUp() {
  isDragging = false;
}

function onMouseLeave() {
  isDragging = false;
}

targetCanvas.addEventListener("mousedown", onMouseDown);
targetCanvas.addEventListener("mousemove", onMouseMove);
targetCanvas.addEventListener("mouseup", onMouseUp);
targetCanvas.addEventListener("mouseleave", onMouseLeave);

// Wheel handler for focal distance
function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY;
  focalDistance += delta * 0.01; // sensitivity
  if (focalDistance < 0.1) focalDistance = 0.1;
  document.getElementById("focalDistance").value = focalDistance;
  showPolygon();
}

targetCanvas.addEventListener("wheel", onWheel);
