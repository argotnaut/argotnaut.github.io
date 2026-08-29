const targetCanvas = document.getElementById("canvas");
const targetCanvasContext = targetCanvas.getContext("2d");
// Global constants for polygon projection
// Camera and shape parameters
let selectedShape = "Cube";
let shapeSizeCoefficient = 40;
const camera = new PerspectiveCamera();
// Shape rotation
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

const g = 1.618033988749895;
const Shapes = {
  Star: new Shape(
    [
      new Vector(
        Math.sin(((2*Math.PI)/5)*1)*shapeSizeCoefficient,
        Math.cos(((2*Math.PI)/5)*1)*shapeSizeCoefficient,
        0,
      ),
      new Vector(
        Math.sin(((2*Math.PI)/5)*2)*shapeSizeCoefficient,
        Math.cos(((2*Math.PI)/5)*2)*shapeSizeCoefficient,
        0,
      ),
      new Vector(
        Math.sin(((2*Math.PI)/5)*3)*shapeSizeCoefficient,
        Math.cos(((2*Math.PI)/5)*3)*shapeSizeCoefficient,
        0,
      ),
      new Vector(
        Math.sin(((2*Math.PI)/5)*4)*shapeSizeCoefficient,
        Math.cos(((2*Math.PI)/5)*4)*shapeSizeCoefficient,
        0,
      ),
      new Vector(
        Math.sin(((2*Math.PI)/5)*5)*shapeSizeCoefficient,
        Math.cos(((2*Math.PI)/5)*5)*shapeSizeCoefficient,
        0,
      ),
    ],
    [
      [3, 1, 4, 2, 0],
    ],
  ),
  Tetragon: new Shape(
    [
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
    [
      [0, 2, 1],
      [0, 1, 3],
      [0, 3, 2],
      [1, 2, 3],
    ],
  ),
  Cube: new Shape(
    [
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
    [
      [0, 4, 6, 2],
      [0, 2, 3, 1],
      [0, 1, 5, 4],
      [7, 6, 4, 5],
      [7, 3, 2, 6],
      [7, 5, 1, 3],
    ],
  ),
  Octahedron: new Shape(
    [
      new Vector(shapeSizeCoefficient, 0, 0),
      new Vector(-shapeSizeCoefficient, 0, 0),
      new Vector(0, shapeSizeCoefficient, 0),
      new Vector(0, -shapeSizeCoefficient, 0),
      new Vector(0, 0, shapeSizeCoefficient),
      new Vector(0, 0, -shapeSizeCoefficient),
    ],
    [
      [0, 2, 4],
      [0, 4, 3],
      [0, 3, 5],
      [0, 5, 2],
      [1, 4, 2],
      [1, 3, 4],
      [1, 5, 3],
      [1, 2, 5],
    ],
  ),
  Icosahedron: new Shape(
    [
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
    [
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
  ),
  Dodecahedron: new Shape(
    [
      new Vector(shapeSizeCoefficient, shapeSizeCoefficient, shapeSizeCoefficient),
      new Vector(shapeSizeCoefficient, shapeSizeCoefficient, -shapeSizeCoefficient),
      new Vector(shapeSizeCoefficient, -shapeSizeCoefficient, shapeSizeCoefficient),
      new Vector(shapeSizeCoefficient, -shapeSizeCoefficient, -shapeSizeCoefficient),
      new Vector(-shapeSizeCoefficient, shapeSizeCoefficient, shapeSizeCoefficient),
      new Vector(-shapeSizeCoefficient, shapeSizeCoefficient, -shapeSizeCoefficient),
      new Vector(-shapeSizeCoefficient, -shapeSizeCoefficient, shapeSizeCoefficient),
      new Vector(-shapeSizeCoefficient, -shapeSizeCoefficient, -shapeSizeCoefficient),
      new Vector(0, shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2)),
      new Vector(0, shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), -shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2)),
      new Vector(0, -shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2)),
      new Vector(0, -shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), -shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2)),
      new Vector(shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0),
      new Vector(shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), -shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0),
      new Vector(-shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0),
      new Vector(-shapeSizeCoefficient * (2 / (1 + Math.sqrt(5))), -shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0),
      new Vector(shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0, shapeSizeCoefficient * (2 / (1 + Math.sqrt(5)))),
      new Vector(-shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0, shapeSizeCoefficient * (2 / (1 + Math.sqrt(5)))),
      new Vector(shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0, -shapeSizeCoefficient * (2 / (1 + Math.sqrt(5)))),
      new Vector(-shapeSizeCoefficient * ((1 + Math.sqrt(5)) / 2), 0, -shapeSizeCoefficient * (2 / (1 + Math.sqrt(5)))),
    ],
    [
      [12, 14, 4, 8, 0],
      [0, 8, 10, 2, 16],
      [16, 18, 1, 12, 0],
      [1, 9, 5, 14, 12],
      [18, 3, 11, 9, 1],
      [2, 10, 6, 15, 13],
      [2, 13, 3, 18, 16],
      [13, 15, 7, 11, 3],
      [17, 6, 10, 8, 4],
      [4, 14, 5, 19, 17],
      [5, 9, 11, 7, 19],
      [17, 19, 7, 15, 6],
    ],
  ),
};

function renderScene() {
  targetCanvas.width = window.innerWidth;
  targetCanvas.height = window.innerHeight;
  const ctx = targetCanvas.getContext("2d");
  const outputVertices = [];
  const shape = Shapes[selectedShape];
  if (!shape) return;
  shape.rotationMatrix = NDMatrix.rotationMatrix(
    rotationX,
    rotationY,
    rotationZ,
  );
  let scene = new Scene(camera, [shape], targetCanvas, ctx);
  scene.render();
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
    startTranslationX = camera.translationVector.x;
    startTranslationY = camera.translationVector.y;
    startTranslationZ = camera.translationVector.z;
  } else {
    // Default to camera if none open
    dragMode = "camera";
    startTranslationX = camera.translationVector.x;
    startTranslationY = camera.translationVector.y;
    startTranslationZ = camera.translationVector.z;
  }
}

function onMouseMove(e) {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  if (dragMode === "camera") {
    const cameraScale = 1.0; // increased sensitivity
    camera.translationVector.x = startTranslationX + dx * cameraScale;
    camera.translationVector.y = startTranslationY + dy * cameraScale;
    if (e.shiftKey) {
      camera.translationVector.z = startTranslationZ + dy * cameraScale;
    }
    // Update input controls
    document.getElementById("translationX").value = camera.translationVector.x;
    document.getElementById("translationY").value = camera.translationVector.y;
    document.getElementById("translationZ").value = camera.translationVector.z;
  } else if (dragMode === "shape") {
    const shapeScale = 0.005;
    rotationX = startRotationX + dy * shapeScale;
    rotationY = startRotationY + dx * shapeScale;
    if (e.shiftKey) {
      rotationZ = startRotationZ + dy * shapeScale;
    }
    // Update input controls
    document.getElementById("rotationX").value = rotationX;
    document.getElementById("rotationY").value = rotationY;
    document.getElementById("rotationZ").value = rotationZ;
  }
  renderScene();
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
  camera.focalLength += delta * 0.01; // sensitivity
  if (camera.focalLength < 0.1) camera.focalLength = 0.1;
  document.getElementById("focalDistance").value = camera.focalLength;
  renderScene();
}

targetCanvas.addEventListener("wheel", onWheel);

// Ensure only one details open at a time
const cameraDetails = document.getElementById("camera-controls");
const shapeDetails = document.getElementById("shape-controls");
cameraDetails.addEventListener("toggle", () => {
  if (cameraDetails.open) {
    shapeDetails.removeAttribute("open");
  }
});
shapeDetails.addEventListener("toggle", () => {
  if (shapeDetails.open) {
    cameraDetails.removeAttribute("open");
  }
});
