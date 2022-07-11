const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...
const ht2 = ht * 2;
const off = side / 2;
const cy1 = ht / 3; // centers of the triangles
const cy2 = (2 * ht) / 3;
const cy3 = ht + cy1;
const cy4 = ht + cy2;

const strip1 = document.querySelector("#strip1");
const strip2 = document.querySelector("#strip2");
const ns = "http://www.w3.org/2000/svg";

function line(strip, x1, y1, x2, y2) {
  let l = document.createElementNS(ns, "line");
  l.setAttribute("x1", x1 * side);
  l.setAttribute("y1", y1 * ht);
  l.setAttribute("x2", x2 * side);
  l.setAttribute("y2", y2 * ht);
  l.setAttribute("stroke", "#CCC");
  strip.appendChild(l);
}

function text(strip, txt, x, y, rotation) {
  let t = document.createElementNS(ns, "text");
  t.innerHTML = txt;
  t.setAttribute("x", x * side);
  t.setAttribute("y", y * ht);
  t.setAttribute("fill", "#CCC");
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  t.setAttribute("font-size", "2em");
  t.setAttribute("font-family", "sans-serif");
  if (rotation) {
    t.setAttribute("transform", `rotate(${rotation}, ${x * side}, ${y * ht})`);
  }
  strip.appendChild(t);
}

const t1 = ["2a", "1b", "3b", "2c", "1d"];
const t2 = ["1a", "3a", "2b", "1c", "3c"];
const t3 = ["6f", "4b", "5b", "6b", "4d"];
const t4 = ["6e", "4a", "5a", "6a", "4c"];
const t5 = ["3d", "2e", "1f", "3f"];
const t6 = ["2d", "1e", "3e", "2f"];
const t7 = ["5d", "6d", "4f", "5f"];
const t8 = ["5c", "6c", "4e", "5e"];

function drawLines() {
  // diagonal lower left to upper right
  for (let n = 0; n < 6; n++) {
    line(strip1, n, 2, n + 1, 0);
  }
  for (let n = 0; n < 5; n++) {
    line(strip2, n, 2, n + 1, 0);
  }
  // diagonal upper left to lower right
  // first and last are half-height
  line(strip1, 0.5, 1, 1, 2);
  for (let n = 0; n < 4; n++) {
    line(strip1, n + 1, 0, n + 2, 2);
  }
  line(strip1, 5, 0, 5.5, 1);
  line(strip2, 0.5, 1, 1, 2);
  for (let n = 0; n < 3; n++) {
    line(strip2, n + 1, 0, n + 2, 2);
  }
  line(strip2, 4, 0, 4.5, 1);
  // horizontal lines
  line(strip1, 1, 0, 6, 0);
  line(strip1, 0.5, 1, 5.5, 1);
  line(strip1, 0, 2, 5, 2);
  line(strip2, 1, 0, 5, 0);
  line(strip2, 0.5, 1, 4.5, 1);
  line(strip2, 0, 2, 4, 2);
}

function addText() {
  for (let n = 0; n < 5; n++) {
    text(strip1, t1[n], n + 1.5, 0.33, 0);
    text(strip1, t2[n], n + 1, 0.66, 0);
    text(strip1, t3[n], n + 1, 1.33, 0);
    text(strip1, t4[n], n + 0.5, 1.66, 0);
  }
  for (let n = 0; n < 4; n++) {
    text(strip2, t5[n], n + 1.5, 0.33, 0);
    text(strip2, t6[n], n + 1, 0.66, 0);
    text(strip2, t7[n], n + 1, 1.33, 0);
    text(strip2, t8[n], n + 0.5, 1.66, 0);
  }
}

drawLines();
addText();

console.log("done");
