
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

color1 = "#0c111f"
color2 = "#0f162a"
currentShape = "quarters"
const tileSize = Math.min(window.innerWidth, window.innerHeight) / 20;
window.addEventListener("resize", () => resizeCanvas(ctx, canvas, currentShape, color1, color2, tileSize));
window.addEventListener("load", () => resizeCanvas(ctx, canvas, currentShape, color1, color2, tileSize));
