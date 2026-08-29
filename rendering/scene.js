class Scene {
  static getBackgroundStyle(ctx, canvas) {
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, "#184b8d");
    gradient.addColorStop(0.25, "#5094e2");
    gradient.addColorStop(0.5, "#d2eeff");
    gradient.addColorStop(0.75, "#d2eeff");
    gradient.addColorStop(1, "#fffff5");
    return gradient;
  }

  constructor(
    camera = new PerspectiveCamera(),
    elements,
    canvas,
    context,
    getBackgroundStyle = Scene.getBackgroundStyle,
  ) {
    this.camera = camera;
    this.elements = elements;
    this.canvas = canvas;
    this.context = context;
    this.getBackgroundStyle = getBackgroundStyle;
  }

  drawLineOnCanvas(x0, y0, x1, y1, color = "#000") {
    const radius = 5;
    this.context.beginPath();
    this.context.moveTo(
      x0 + this.canvas.width / 2,
      y0 + this.canvas.height / 2,
    );
    this.context.lineTo(
      x1 + this.canvas.width / 2,
      y1 + this.canvas.height / 2,
    );
    this.context.strokeStyle = color;
    this.context.lineWidth = 2;
    this.context.stroke();
  }

  drawPointOnCanvas(x, y, color = "#000") {
    const radius = 5;
    this.context.beginPath();
    this.context.arc(
      x + this.canvas.width / 2,
      y + this.canvas.height / 2,
      radius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = color;
    this.context.fill();
  }

  drawPolygonOnCanvas(face, fillColor = "#da0000AA", strokeColor = "#000") {
    const radius = 5;
    this.context.beginPath();
    const originAdjusted = (x, y) => {
      return {
        x: x + this.canvas.width / 2,
        y: y + this.canvas.height / 2,
      };
    };
    const vertices = face.vertexCoordinates;
    const initialPoint = originAdjusted(vertices[0].x, vertices[0].y);
    this.context.moveTo(initialPoint.x, initialPoint.y);
    for (let i = 1; i < vertices.length; i++) {
      const vertex = originAdjusted(vertices[i].x, vertices[i].y);
      this.context.lineTo(vertex.x, vertex.y);
    }
    this.context.strokeStyle = strokeColor;
    this.context.lineWidth = 2;
    this.context.fillStyle = fillColor;
    this.context.closePath();
    this.context.stroke();
    this.context.fill();
  }

  drawTextOnCanvas(text, x, y, fillColor = "#000") {
    this.context.font = "20px serif";
    this.context.fillStyle = fillColor;
    this.context.fillText(
      text,
      x + this.canvas.width / 2,
      y + this.canvas.height / 2,
    );
  }

  render() {
    this.context.fillStyle = this.getBackgroundStyle(this.context, this.canvas);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Collect all the renderable objects in one array
    let renderables = [];
    this.elements.forEach((element) => {
      if (typeof element.getRenderables === "function") {
        renderables.push(...element.getRenderables());
      }
    });

    // 2. Sort the array of renderable objects by distance from the camera
    const cameraScalingMatrix = this.camera.getScalingMatrix();
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
          obj.vertexCoordinates[i] = this.camera.projectOntoCameraPlane(
            obj.vertexCoordinates[i],
          );
        }
        return obj;
      };
      if (isPoint(element)) {
        projectedRenderables.push(this.camera.projectOntoCameraPlane(element));
      } else if (isLine(element)) {
        element.start = this.camera.projectOntoCameraPlane(element.start);
        element.end = this.camera.projectOntoCameraPlane(element.end);
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
        this.drawPointOnCanvas(element.x, element.y);
      } else if (isLine(element)) {
        this.drawLineOnCanvas(
          element.start.x,
          element.start.y,
          element.end.x,
          element.end.y,
        );
      } else if (isFace(element)) {
        const centroid = element.getCentroid();
        const normalVector = renderables[i].getNormal(normalScale);
        let color = "#FF0000";
        if (principalVector.dot(normalVector) > 0) {
          const rgb = hexToRgb(color);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          hsl.l *= Math.max(
            0.1,
            -(normalVector.y - 50) / normalVector.magnitude(),
          );
          const newRGB = hslToRgb(hsl.h, hsl.s, hsl.l);
          const newHex = hslToHex(hsl.h, hsl.s, hsl.l) + "AA";
          this.drawPolygonOnCanvas(element, newHex);
          color = "#00FF00";
        }
        this.drawPointOnCanvas(centroid.x, centroid.y, color);
        element.vertexCoordinates.forEach((vertex) => {
          this.drawPointOnCanvas(vertex.x, vertex.y);
        });
      }
    }
  }
}
