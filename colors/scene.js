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
    camera = new Camera(),
    elements,
    canvas,
    context,
    getBackgroundStyle = Scene.getBackgroundStyle
  ) {
    this.camera = camera;
    this.elements = elements;
    this.canvas = canvas;
    this.context = context;
    this.getBackgroundStyle = getBackgroundStyle;
  }

  render() {
    this.context.fillStyle = this.getBackgroundStyle(this.context, this.canvas);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.elements.forEach(element => {
        if (typeof(element.render) == "function") {
            element.render(this.canvas, this.context, this.camera)
        }
    });
  }
}
