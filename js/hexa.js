import { html, svg, $, $$ } from "./dom.js";

const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...

const strip1 = document.querySelector("#strip1");
const strip2 = document.querySelector("#strip2");
const ns = "http://www.w3.org/2000/svg";

// Text labels for triangles
// const t1 = ["2a", "1b", "3b", "2c", "1d"]; // strip 1, row 1, point down
// const t2 = ["1a", "3a", "2b", "1c", "3c"]; // strip 1, row 1, point up
// const t3 = ["6f", "4b", "5b", "6b", "4d"]; // strip 1, row 2, point down
// const t4 = ["6e", "4a", "5a", "6a", "4c"]; // strip 1, row 2, point up
// const t5 = ["3d", "2e", "1f", "3f"]; // strip 2, row 1, point down
// const t6 = ["2d", "1e", "3e", "2f"]; // strip 2, row 1, point up
// const t7 = ["5d", "6d", "4f", "5f"]; // strip 2, row 2, point down
// const t8 = ["5c", "6c", "4e", "5e"]; // strip 2, row 2, point up

// text and rotations for strips
// key: t=text, s=strip, a=angle of rotation, x,y centerpoint
const text_labels = [
  { t: "2a", s: strip1, a: 60, x: 1.5, y: 0.33 },
  { t: "1b", s: strip1, a: 120, x: 2.5, y: 0.33 },
  { t: "3b", s: strip1, a: 120, x: 3.5, y: 0.33 },
  { t: "2c", s: strip1, a: 180, x: 4.5, y: 0.33 },
  { t: "1d", s: strip1, a: -120, x: 5.5, y: 0.33 },
  { t: "1a", s: strip1, a: 0, x: 1, y: 0.66 },
  { t: "3a", s: strip1, a: 0, x: 2, y: 0.66 },
  { t: "2b", s: strip1, a: 60, x: 3, y: 0.66 },
  { t: "1c", s: strip1, a: 120, x: 4, y: 0.66 },
  { t: "3c", s: strip1, a: 120, x: 5, y: 0.66 },
  { t: "6f", s: strip1, a: 60, x: 1, y: 1.33 },
  { t: "4b", s: strip1, a: 180, x: 2, y: 1.33 },
  { t: "5b", s: strip1, a: 180, x: 3, y: 1.33 },
  { t: "6b", s: strip1, a: 180, x: 4, y: 1.33 },
  { t: "4d", s: strip1, a: -60, x: 5, y: 1.33 },
  { t: "6e", s: strip1, a: 60, x: 0.5, y: 1.66 },
  { t: "4a", s: strip1, a: 180, x: 1.5, y: 1.66 },
  { t: "5a", s: strip1, a: 180, x: 2.5, y: 1.66 },
  { t: "6a", s: strip1, a: 180, x: 3.5, y: 1.66 },
  { t: "4c", s: strip1, a: -60, x: 4.5, y: 1.66 },
  { t: "3d", s: strip2, a: -120, x: 1.5, y: 0.33 },
  { t: "2e", s: strip2, a: -60, x: 2.5, y: 0.33 },
  { t: "1f", s: strip2, a: 0, x: 3.5, y: 0.33 },
  { t: "3f", s: strip2, a: 0, x: 4.5, y: 0.33 },
  { t: "2d", s: strip2, a: 180, x: 1, y: 0.66 },
  { t: "1e", s: strip2, a: -120, x: 2, y: 0.66 },
  { t: "3e", s: strip2, a: -120, x: 3, y: 0.66 },
  { t: "2f", s: strip2, a: -60, x: 4, y: 0.66 },
  { t: "5d", s: strip2, a: -60, x: 1, y: 1.33 },
  { t: "6d", s: strip2, a: -60, x: 2, y: 1.33 },
  { t: "4f", s: strip2, a: 60, x: 3, y: 1.33 },
  { t: "5f", s: strip2, a: 60, x: 4, y: 1.33 },
  { t: "5c", s: strip2, a: -60, x: 0.5, y: 1.66 },
  { t: "6c", s: strip2, a: -60, x: 1.5, y: 1.66 },
  { t: "4e", s: strip2, a: 60, x: 2.5, y: 1.66 },
  { t: "5e", s: strip2, a: 60, x: 3.5, y: 1.66 },
];

function addText() {
  text_labels.forEach(l => text(l.s, l.t, l.x, l.y, l.a));
}

function line(strip, x1, y1, x2, y2) {
  strip.appendChild(
    svg("line", {
      x1: x1 * side,
      y1: y1 * ht,
      x2: x2 * side,
      y2: y2 * ht,
      stroke: "#CCC",
    })
  );
}

function text(strip, txt, x, y, rotation) {
  strip.appendChild(
    svg(
      "text",
      {
        x: x * side,
        y: y * ht,
        fill: "#CCC",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "font-size": "2em",
        "font-family": "sans-serif",
        transform: `rotate(${rotation}, ${x * side}, ${y * ht})`,
      },
      txt
    )
  );
}

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

drawLines();
addText();

console.log("done");
