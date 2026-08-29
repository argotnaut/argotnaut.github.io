const targetCanvas = document.getElementById("canvas");
const targetCanvasContext = targetCanvas.getContext("2d");
const pointsInput = document.getElementById("points");
const hopsInput = document.getElementById("hops");

// Scene rendering globals
const camera = new Camera();
camera.focalLength = 50;
camera.translationVector.y = 0;
camera.translationVector.x = 0;
camera.translationVector.z = 700;
camera.skew = 0;
camera.principalX = 0;
camera.principalY = 0;
var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;
let shapeSizeCoefficient = 40;

function render(inputScene) {
  inputScene.context.fillStyle = inputScene.getBackgroundStyle(
    inputScene.context,
    inputScene.canvas,
  );
  inputScene.context.fillRect(
    0,
    0,
    inputScene.canvas.width,
    inputScene.canvas.height,
  );

  // 1. Collect all the renderable objects in one array
  let renderables = [];
  inputScene.elements.forEach((element) => {
    if (typeof element.getRenderables === "function") {
      renderables.push(...element.getRenderables());
    }
  });

  // 2. Sort the array of renderable objects by distance from the camera
  const cameraScalingMatrix = inputScene.camera.getScalingMatrix();
  const principalVector = new Vector(
    cameraScalingMatrix.m[0][2],
    cameraScalingMatrix.m[1][2],
    cameraScalingMatrix.m[2][2],
  );
  const isPoint = (obj) =>
    obj.x !== undefined && obj.y !== undefined && obj.z !== undefined;
  const isLine = (obj) => obj.start !== undefined && obj.end !== undefined;
  const isFace = (obj) => obj.vertexCoordinates !== undefined;
  const isShape = (obj) => typeof obj.getFaces === "function";
  const furthestDistanceFromCamera = (elem) => {
    if (isPoint(elem)) {
      return elem.distanceTo(principalVector);
    } else if (isLine(elem)) {
      return Math.max(
        elem.start.distanceTo(principalVector),
        elem.end.distanceTo(principalVector),
      );
    } else if (isFace(elem)) {
      return elem.vertexCoordinates.reduce(
        (a, b) => Math.max(a, b.distanceTo(principalVector)),
        0,
      );
    } else if (isShape(elem)) {
      return elem
        .getVertices()
        .reduce((a, b) => Math.max(a, b.distanceTo(principalVector)), 0);
    }
  };
  renderables = renderables.sort((a, b) => {
    return furthestDistanceFromCamera(b) - furthestDistanceFromCamera(a);
  });

  // 3. Project all of the coordinates for the renderable objects onto the camera plane
  let projectedRenderables = [];
  renderables.forEach((element) => {
    const projectFace = (obj) => {
      for (let i = 0; i < obj.vertexCoordinates.length; i++) {
        obj.vertexCoordinates[i] = inputScene.camera.projectOntoCameraPlane(
          obj.vertexCoordinates[i],
        );
      }
      return obj;
    };
    if (isPoint(element)) {
      projectedRenderables.push(
        inputScene.camera.projectOntoCameraPlane(element),
      );
    } else if (isLine(element)) {
      element.start = inputScene.camera.projectOntoCameraPlane(element.start);
      element.end = inputScene.camera.projectOntoCameraPlane(element.end);
      projectedRenderables.push(element);
    } else if (isFace(element)) {
      projectFace(element);
      projectedRenderables.push(element);
    } else if (isShape(element)) {
      element.getFaces().forEach((face) => {
        projectedRenderables.push(projectFace(face));
      });
    }
  });

  // 4. Draw all the projected renderable objects on the canvas
  for (let i = 0; i < projectedRenderables.length; i++) {
    const element = projectedRenderables[i];
    if (isPoint(element)) {
      inputScene.drawPointOnCanvas(element.x, element.y);
    } else if (isLine(element)) {
      inputScene.drawLineOnCanvas(
        element.start.x,
        element.start.y,
        element.end.x,
        element.end.y,
      );
    } else if (isFace(element)) {
      const normalVector = renderables[i].getNormal(normalScale);
      let color = "#FF0000";
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      hsl.l *= Math.max(0.1, -(normalVector.y - 50) / normalVector.magnitude());
      const newRGB = hslToRgb(hsl.h, hsl.s, hsl.l);
      const newHex = hslToHex(hsl.h, hsl.s, hsl.l) + "AA";
      inputScene.drawPolygonOnCanvas(element, newHex);
      element.vertexCoordinates.forEach((vertex) => {
        inputScene.drawPointOnCanvas(vertex.x, vertex.y);
      });
    }
  }
}

function getSchlafliPolygon(p, q, r, s) {
  const angle = (Math.PI * 2) / p;
  let points = new LinkedList();

  for (let num_points = 0; num_points < p; num_points++) {
    const p_cx = Math.cos((angle) * num_points) * shapeSizeCoefficient;
    const p_cy = Math.sin((angle) * num_points) * shapeSizeCoefficient;
    points.append(new Vector(p_cx, p_cy, 0));
  }
  let current_point_idx = 0;
  let outputVertices = points.asArray();
  let face = [];
  let num_points = 0;
  do {
    face.push(current_point_idx);
    current_point_idx = (current_point_idx + q) % outputVertices.length;
    num_points++;
  } while (num_points < points.length);
  return new Shape(outputVertices, [
    face, // This shape will only have one face, as it's 2-D
  ]);
}

function interiorAngleForFace(p, q) {
  return Math.PI - ((Math.PI * 2 * q) / p);
}

function toDegrees(rads) {
  return (rads / (2*Math.PI))*360;
}

function getHeightOfFace(faceSideLength, faceInteriorAngle) {
  const apothem = (faceSideLength*Math.tan(faceInteriorAngle/2))/2;
  const circumradius = faceSideLength / (2*Math.cos(faceInteriorAngle/2));
  return apothem + circumradius;
}

/**
 * Compute the angle θ from given γ and α using the relation:
 * cos(γ/2) = cos(α/2) / sqrt(cos²θ + cos²(α/2) sin²θ).
 *
 * Derived formula:
 *   cosθ = cot(α/2) * tan(γ/2)
 *   θ   = arccos(cosθ)
 *
 * @param {number} polygonsAngle - Angle α in radians.
 * @param {number} interiorAngle - Angle γ in radians.
 * @returns {number} θ in radians, or NaN if the value is outside [-1,1] (no real solution).
 */
function getTiltAngle(polygonsAngle, interiorAngle) {
  if (
    polygonsAngle.toPrecision(8) == interiorAngle.toPrecision(8)
    || polygonsAngle < interiorAngle
  ) {
    return 0;
  }
  // Half‑angles
  const a2 = polygonsAngle / 2;
  const g2 = interiorAngle / 2;

  // Compute cot(a2) * tan(g2)
  const sinA2 = Math.sin(a2);
  const cosA2 = Math.cos(a2);
  const sinG2 = Math.sin(g2);
  const cosG2 = Math.cos(g2);

  // Avoid division by zero
  if (sinA2 === 0) return NaN;

  const cosTheta = (cosA2 / sinA2) * (sinG2 / cosG2);

  // Clamp to [-1,1] to guard against numerical errors
  if (cosTheta < -1 || cosTheta > 1) return NaN;

  return Math.acos(cosTheta);
}

function getShapeFromSchlafliSymbol(points, hops, numberOfPolygons, n) {
  const closeDefect = document.getElementById("closeDefectAngle").checked;
  const shape = getSchlafliPolygon(points, hops);
  const polygonsAngle = (Math.PI * 2) / numberOfPolygons;
  const interiorAngle = interiorAngleForFace(points, hops);
  let compensationAngle = 0
  if (polygonsAngle < interiorAngle || !closeDefect) {
    compensationAngle = polygonsAngle - interiorAngle;
  }
  let rotationAngle = ((polygonsAngle-compensationAngle) * n);
  const tiltAngle = closeDefect ? getTiltAngle(
    polygonsAngle,
    interiorAngle
  ) : 0;

  shape.rotationMatrix = NDMatrix.rotationMatrix(0, tiltAngle, rotationAngle);
  shape.translationVector = new Vector(
    shape.translationVector.x +
      Math.cos(rotationAngle) * -(shapeSizeCoefficient*(Math.cos(tiltAngle))),
    shape.translationVector.y +
      Math.sin(rotationAngle) * -(shapeSizeCoefficient*(Math.cos(tiltAngle))),
    shape.translationVector.z,
  );
  return shape;
}

function renderScene() {
  targetCanvas.width = window.innerWidth;
  targetCanvas.height = window.innerHeight;
  const outputVertices = [];

  const points = parseFloat(document.getElementById("points").value);
  const hops = parseFloat(document.getElementById("hops").value);
  // Get dynamic parameters from UI
  const numberOfPolygons = parseInt(document.getElementById("numberOfPolygons").value) || 4;
  const polygonTurningNumber = parseInt(document.getElementById("polygonTurningNumber").value) || 1;

  let shape = new Shape([], [], Camera.defaultRotationMatrix, new Vector(0,0,0));
  for (let n = 1; n <= numberOfPolygons; n++) {
    const newShape = getShapeFromSchlafliSymbol(points, hops, numberOfPolygons, n)
    const newVertices = newShape.getVertices();
    newShape.faces.forEach(face => {
      let adjustedvertexIdxs = [];
      face.forEach(vert => adjustedvertexIdxs.push(vert+shape.vertices.length));
      shape.faces.push(adjustedvertexIdxs);
    });
    shape.vertices.push(...newVertices);
  }
  shape.rotationMatrix = NDMatrix.rotationMatrix(
    rotationX,
    rotationY,
    rotationZ
  );

  let scene = new Scene(camera, [shape], targetCanvas, targetCanvasContext);
  render(scene);
}

// UI handlers
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startTranslationX = 0;
let startTranslationY = 0;
let startTranslationZ = 0;
let startRotationX = 0;
let startRotationY = 0;
let startRotationZ = 0;

function onMouseDown(e) {
  e.preventDefault();
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startRotationX = rotationX;
  startRotationY = rotationY;
  startRotationZ = rotationZ;
}

function onMouseMove(e) {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const shapeScale = 0.005;
  rotationX = startRotationX + dy * shapeScale;
  rotationY = startRotationY + dx * shapeScale;
  if (e.shiftKey) {
    rotationZ = startRotationZ + dy * shapeScale;
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
  renderScene();
}

targetCanvas.addEventListener("wheel", onWheel);
