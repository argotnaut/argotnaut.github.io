// Circular Linked List implementation
class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Append a new node with the given value to the list
  append(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      // First node; points to itself to form a circle
      this.head = this.tail = node;
      node.next = node;
    } else {
      // Insert node after tail and update tail
      this.tail.next = node;
      this.tail = node;
      node.next = this.head;
    }
    this.length++;
    return node;
  }
}

const targetCanvas = document.getElementById("canvas");
const targetCanvasContext = targetCanvas.getContext("2d");
const pointsInput = document.getElementById("points");
const hopsInput = document.getElementById("hops");

async function drawPoints(n, hops, canvas, ctx) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(canvas.width, canvas.height) / 3;
  const p_r = 3;
  const angle = (Math.PI * 2) / n;
  let points = new LinkedList();
  
  for (let num_points = 0; num_points < n; num_points++) {
    const p_cx = cx + Math.cos(angle*num_points) * r;
    const p_cy = cy + Math.sin(angle*num_points) * r;
    ctx.beginPath();
    ctx.arc(p_cx, p_cy, p_r, 0, Math.PI * 2);
    ctx.fillStyle = "#43dc71";
    ctx.fill();
    points.append({
      cx: p_cx,
      cy: p_cy,
    });
  }
  // Initialize the current point
  let current_point = points.head;
  /*
  A list of all the points where a new star was started
  (useful for degenerate star polygons)
  */
  let starting_points = [points.head];
  let num_points = 0;
  do {
    /*
    Get the next point to lineTo by "hopping" a certain number
    (the Turning number) of points around the circle
    */
    let next_point = current_point;
    for (let p = 1; p <= hops; p++) {
      next_point = next_point.next
    }
    /*
    Make the line from the current point to the next
    */
    ctx.beginPath();
    ctx.moveTo(current_point.value.cx, current_point.value.cy);
    ctx.lineTo(next_point.value.cx, next_point.value.cy);
    ctx.strokeStyle = "#0084ff";
    ctx.stroke();
    current_point = next_point
    num_points++
    /*
    If we just lined back to an already visited point, closing
    a shape, advance to the next point, starting a new shape (this
    avoids duplicating existing lines)
    */
    if (starting_points.includes(current_point)) {
      current_point = current_point.next
      starting_points.push(current_point)
    }
  } while (num_points < points.length);
}

function resizeCanvas() {
  targetCanvas.style.background = "#0f1b4d";
  targetCanvas.width = window.innerWidth;
  targetCanvas.height = window.innerHeight;
  drawPoints(
    pointsInput.valueAsNumber,
    hopsInput.valueAsNumber,
    targetCanvas,
    targetCanvasContext,
  );
}
