const side = 125; // 10 triangles across 1250 pixels
const ht = 108.25; // height of triangle, 108.2531...
const off = side / 2;

const strip = document.querySelector("#strip");

function line(x1, y1, x2, y2, color) {
  let l = document.createElement("line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", color);
  strip.appendChild(l);
}

for (let n = 0; n < 10; n++) {
  line(n * side, ht, n * side + off, 0, "#CCC");
  line(n * side + off, 0, (n + 1) * side, ht, "#FCC");
}

console.log("done");
