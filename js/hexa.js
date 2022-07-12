import { html, svg, $, $$, listen } from "./dom.js";

const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...

const strip1 = $("#strip1");
const strip2 = $("#strip2");
const hex = $("#hex");
const hexDefs = $("defs");

// hex points
const p0 = { x: side * 1, y: ht * 1 }; // centre point
const p1 = { x: side * 0, y: ht * 1 };
const p2 = { x: side * 0.5, y: ht * 0 };
const p3 = { x: side * 1.5, y: ht * 0 };
const p4 = { x: side * 2, y: ht * 1 };
const p5 = { x: side * 1.5, y: ht * 2 };
const p6 = { x: side * 0.5, y: ht * 2 };

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

function triClip(num, p1, p2, p3) {
  hexDefs.appendChild(
    svg(
      "clipPath",
      {
        id: `tri${num}`,
      },
      svg("polygon", {
        points: `${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`,
      })
    )
  );
}

// copy triangle from hex to strip
function useHex(strip, img, dx, dy, id) {
  // should include rotation and midpoint of triangle in strip
  strip.appendChild(
    svg("use", {
      href: `#hextri${img}_${id}`,
      x: side * dx,
      y: ht * dy,
    })
  );
}

function use(num) {
  for (let img = 1; img < 7; img++) {
    // use the image from defs and clip with the triangles from defs.
    hex.appendChild(
      svg("use", {
        href: `#image${img}`,
        id: `hextri${img}_${num}`,
        "clip-path": `url(#tri${num})`,
      })
    );
  }
}

function draw_hex() {
  for (let n = 1; n < 7; n++) {
    use(n);
  }
}

function prepDefs() {
  triClip(1, p1, p2, p0);
  triClip(2, p2, p3, p0);
  triClip(3, p3, p4, p0);
  triClip(4, p4, p5, p0);
  triClip(5, p5, p6, p0);
  triClip(6, p6, p1, p0);
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

class Image {
  constructor(sel, scale, x, y) {
    this.image = $(sel);
    this.originalWidth = this.image.width;
    this.originalHeight = this.image.height;
    this._scale = scale || 1;
    this._x = x || 0;
    this._y = y || 0;
  }
  get x() {
    return this._x;
  }
  set x(val) {
    this._x = val;
    this.image.setAttribute("x", this._x);
  }
  get y() {
    return this._y;
  }
  set y(val) {
    this._y = val;
    this.image.setAttribute("y", this._y);
  }
  get scale() {
    return this._scale;
  }
  set scale(val) {
    this._scale = val;
    this.image.setAttribute("width", this.originalWidth * this._scale);
    this.image.setAttribute("height", this.originalHeight * this._scale);
  }
}

// class Hex {
//   static lastIndex = 0;
//   constructor(image, triangleMappings) {
//     this.index = ++this.constructor.lastIndex;
//     this.scale = 1.0;
//     this.pan = { x: 0, y: 0 };
//     this.rotated = false;
//     this.triangleMappings = triangleMappings;
//     this.image = image;
//     this.originalWidth = image.width;
//     this.originalHeight = image.height;
//   }
//   draw() {
//     // replaces hex_to_strip()
//     // called once to setup mapping
//     this.triangleMappings.forEach((m, idx) => {
//       useHex(m.x, m.y, idx);
//     });
//   }
// }

const images = [
  new Image("#image1"),
  new Image("#image2"),
  new Image("#image3"),
  new Image("#image4"),
  new Image("#image5"),
  new Image("#image6"),
];

let image = images[0];

function chooseImage(evt) {
  let idx = parseInt(evt.target.value, 10) - 1; // target values are 1-based
  image = images[idx];
  hex.viewBox.baseVal.x = -350 * idx;
}

function subscribe_events() {
  listen("#scale-down", "click", () => (image.scale *= 0.8));
  listen("#scale-up", "click", () => (image.scale *= 1.2));
  listen("#pan-right", "click", () => (image.x += 10));
  listen("#pan-left", "click", () => (image.x -= 10));
  listen("#pan-up", "click", () => (image.y -= 10));
  listen("#pan-down", "click", () => (image.y += 10));
  listen("input[type=radio]", "input", chooseImage);
}

function hex_to_strip() {
  // multiplier for x, multiplier for y, id
  // useHex(image, dx, dy, hexTriangle
  // NOTE: currently you have to add the offset for top/left position in strip, but *subtract*
  // the offset of the triangle in the hexagon. Normalize from hex first
  useHex(strip1, 1, 0.5, 0, 1);
  useHex(strip1, 1, 1.5, 0, 2);
  useHex(strip1, 1, 2.5, 0, 3);
  useHex(strip1, 1, 3.5, -1, 4);
  useHex(strip2, 1, 1.5, -1, 5);
  useHex(strip2, 1, 3.5, -1, 6);
  // next
  // useHex(2, 0.5, 0, 1);
}

drawLines();
addText();
prepDefs();
draw_hex();
subscribe_events();
hex_to_strip();

console.log("done");
