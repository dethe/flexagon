const side = 125; // 10 triangles across 1250 pixels
const ht = 108.25; // height of triangle, 108.2531...
const ht2 = ht * 2;
const off = side / 2;
const cy1 = ht / 3; // centers of the triangles
const cy2 = (2 * ht) / 3;
const cy3 = ht + cy1;
const cy4 = ht + cy2;

const strip = document.querySelector("#strip");
const ns = "http://www.w3.org/2000/svg";

function line(x1, y1, x2, y2, color) {
  let l = document.createElementNS(ns, "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", color);
  strip.appendChild(l);
}

function text(txt, x, y, color, flip) {
  let t = document.createElementNS(ns, "text");
  t.innerHTML = txt;
  //   t.classList.add("noprint");
  t.setAttribute("x", x);
  t.setAttribute("y", y);
  t.setAttribute("fill", color);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  t.setAttribute("font-size", "2em");
  t.setAttribute("font-family", "sans-serif");
  if (flip) {
    t.setAttribute("transform", `rotate(180, ${x}, ${y})`);
  }
  strip.appendChild(t);
}

const t1 = ["2a", "1b", "3b", "2c", "1d", "3d", "2e", "1f", "3f"];
const t2 = ["1a", "3a", "2b", "1c", "3c", "2d", "1e", "3e", "2f", ""];
const t3 = ["", "4b", "5b", "6b", "4d", "5d", "6d", "4f", "5f", "6f"];
const t4 = ["4a", "5a", "6a", "4c", "5c", "6c", "4e", "5e", "6e"];

for (let n = 0; n < 10; n++) {
  let x1 = n * side;
  let x2 = x1 + off;
  let x3 = (n + 1) * side;
  line(x1, ht, x2, 0, "#CCC");
  if (n < 9) {
    line(x2, 0, x3, ht, "#FCC");
    text(t1[n], x3, cy1, "#CCC");
  }
  text(t2[n], x2, cy2, "#CCC");
  line(x2, ht2, x3, ht, "#FCC");
  if (n) {
    line(x1, ht, x2, ht2, "#CCC");
  }
  text(t3[n], x2, cy3, "#CCC", true);
  if (n < 9) {
    text(t4[n], x3, cy4, "#CCC", true);
  }
}
line(off, 0, side * 9 + off, 0, "#CFC");
line(0, ht, side * 10, ht, "#CCF");
line(off, ht2, side * 9 + off, ht2, "#0CC");

console.log("done");
