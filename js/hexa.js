import { html, svg, $, $$, listen } from "./dom.js";

const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...

const strip1 = $("#strip1");
const strip2 = $("#strip2");
const hex = $("#hex");
let hexDefs;

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
  { t: "1a", s: strip1, a: 120, x: 4, y: 0.66 },
  { t: "1b", s: strip1, a: 120, x: 2.5, y: 0.33 },
  { t: "1c", s: strip1, a: 0, x: 1, y: 0.66 },
  { t: "1d", s: strip2, a: 0, x: 3.5, y: 0.33 },
  { t: "1e", s: strip2, a: -120, x: 2, y: 0.66 },
  { t: "1f", s: strip1, a: -120, x: 5.5, y: 0.33 },
  { t: "2a", s: strip1, a: 180, x: 4.5, y: 0.33 },
  { t: "2b", s: strip1, a: 60, x: 3, y: 0.66 },
  { t: "2c", s: strip1, a: 60, x: 1.5, y: 0.33 },
  { t: "2d", s: strip2, a: -60, x: 4, y: 0.66 },
  { t: "2e", s: strip2, a: -60, x: 2.5, y: 0.33 },
  { t: "2f", s: strip2, a: 180, x: 1, y: 0.66 },
  { t: "3a", s: strip1, a: 120, x: 5, y: 0.66 },
  { t: "3b", s: strip1, a: 120, x: 3.5, y: 0.33 },
  { t: "3c", s: strip1, a: 0, x: 2, y: 0.66 },
  { t: "3d", s: strip2, a: 0, x: 4.5, y: 0.33 },
  { t: "3e", s: strip2, a: -120, x: 3, y: 0.66 },
  { t: "3f", s: strip2, a: -120, x: 1.5, y: 0.33 },
  { t: "4a", s: strip1, a: 180, x: 2, y: 1.33 },
  { t: "4b", s: strip1, a: 180, x: 1.5, y: 1.66 },
  { t: "4c", s: strip2, a: 60, x: 3, y: 1.33 },
  { t: "4d", s: strip2, a: 60, x: 2.5, y: 1.66 },
  { t: "4e", s: strip1, a: -60, x: 5, y: 1.33 },
  { t: "4f", s: strip1, a: -60, x: 4.5, y: 1.66 },
  { t: "5a", s: strip1, a: 180, x: 3, y: 1.33 },
  { t: "5b", s: strip1, a: 180, x: 2.5, y: 1.66 },
  { t: "5c", s: strip2, a: 60, x: 4, y: 1.33 },
  { t: "5d", s: strip2, a: 60, x: 3.5, y: 1.66 },
  { t: "5e", s: strip2, a: -60, x: 1, y: 1.33 },
  { t: "5f", s: strip2, a: -60, x: 0.5, y: 1.66 },
  { t: "6a", s: strip1, a: 180, x: 4, y: 1.33 },
  { t: "6b", s: strip1, a: 180, x: 3.5, y: 1.66 },
  { t: "6c", s: strip1, a: 60, x: 1, y: 1.33 },
  { t: "6d", s: strip1, a: 60, x: 0.5, y: 1.66 },
  { t: "6e", s: strip2, a: -60, x: 2, y: 1.33 },
  { t: "6f", s: strip2, a: -60, x: 1.5, y: 1.66 },
];

function defaultImage(idx) {
  let img = svg("image", {
    href: `images/kaleidoscope${idx}.png`,
  });
  img.decode().then(() => renderImage(img, idx));
  return img;
}

function renderImage(img, idx) {
  images[idx] = new HexImage(img);
  images[idx].center();
  if ((currImageIdx = idx)) {
    image = images[idx];
  }
  let oldImg = $(`#image${idx}`);
  if (oldImg) {
    oldImg.remove();
  }
  img.id = `image${idx}`;
}

function addHexDefs() {
  hexDefs = svg("defs", {}, [1, 2, 3, 4, 5, 6].map(defaultImage));
  strip1.appendChild(hexDefs);
}

function addText() {
  text_labels.forEach(l => text(l.s, l.t, l.x, l.y, l.a));
}

function hexX(info) {
  // hex offset in "sides" for x, given info
  switch (info.t[1]) {
    case "a": // fall through
    case "f":
      return 0;
    case "b": // fall through
    case "e":
      return 0.5;
    case "c": // fall through
    case "d":
      return 1.0;
    default:
      throw new Error("Unexpected value for hx: ", name);
  }
}

function hexY(info) {
  // hex offset in "hts" for y, given info
  if (info.t[1].charCodeAt() < 100) {
    return 0;
  } else {
    return 1;
  }
}

function stripX(info) {
  // strip offset in "sides" for x, given info
  return info.x - 0.5; // info.x is the centrepoint
}

function stripY(info) {
  // strip offset in "sides" for y, given info
  if (info.y < 1) {
    // info.y is the centrepoint
    return 0;
  } else {
    return 1;
  }
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

function triangleIndex(info) {
  // convert letter in name to number. a = 1, b = 2, etc.
  return info.t.charCodeAt(1) - 96;
}

function imageIndex(info) {
  // convert number in name to number
  return parseInt(info.t[0], 10);
}

function draw_hex() {
  for (let img = 1; img < 7; img++) {
    let g = svg("g", { transform: `translate(${(img - 1) * 350}, 0)` });
    for (let tri = 1; tri < 7; tri++) {
      // use the image from defs and clip with the triangles from defs.
      g.appendChild(
        svg("use", {
          href: `#image${img}`,
          id: `hextri${img}_${tri}`,
          "clip-path": `url(#tri${tri})`,
        })
      );
    }
    hex.appendChild(g);
  }
}

function prepDefs() {
  addHexDefs();
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

class HexImage {
  constructor(img) {
    this.image = img;
    this.originalWidth = this.image.width.baseVal.value;
    this.originalHeight = this.image.height.baseVal.value;
    this._scale = 1;
    this._x = 0;
    this._y = 0;
  }
  center() {
    // scale and position image
    let w = this.image.width.baseVal.value;
    let h = this.image.height.baseVal.value;
    if (Math.min(w, h) < 1) {
      console.log(`Why doesn't this image have height/width? (${w},${h})`);
    }
    this.scale = 350 / Math.min(w, h);
    if (w > 350) {
      this.image.x = -(w - 350) / 2;
    }
    if (h > 300) {
      this.image.y = -(h - 300) / 2;
    }
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
    console.log(
      `scale: ${val} (${typeof val}), originalWidth: ${
        this.originalWidth
      } (${typeof this.originalWidth})`
    );
    this._scale = val;
    this.image.setAttribute("width", this.originalWidth * this._scale);
    this.image.setAttribute("height", this.originalHeight * this._scale);
  }
}

let images = [];
let image;
let currImageIdx = 1;

function chooseImage() {
  let idx = parseInt($("input[type=radio]:checked").value, 10); // target values are 1-based
  currImageIdx = idx;
  image = images[idx];
  hex.viewBox.baseVal.x = 350 * idx;
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

function rotY(info) {
  if (imageIndex(info) === 1 || imageIndex(info) === 3) {
    return info.y;
  }
  let val = info.y;
  if (info.y > 1) {
    val -= 1;
  }
  if (val < 0.5) {
    val = 0.66;
  } else {
    val = 0.33;
  }
  if (info.y > 1) {
    val += 1;
  }
  return val;
}

function rot(info) {
  if (info.a === 0) {
    return "";
  }
  // return `rotate(${info.a} ${info.x * side} ${(info.y > 1 ? 1.5 : 0.5) * ht})`;
  // return `rotate(${info.a} ${info.x * side} ${info.y * ht})`;
  // return `rotate(${info.a} ${info.x * side} ${rotY(info) * ht})`;
  // return `rotate(180, ${info.x * side}, ${(info.y > 1 ? 1.5 : 0.5) * ht})`;
  // return `rotate(180, ${info.x * side}, ${
  //   (info.y > 1 ? 1.5 : 0.5) * ht
  // }) rotate(${info.a - 180} ${info.x * side} ${info.y * ht})`;
  if (imageIndex(info) === 1 || imageIndex(info) === 3) {
    return `rotate(${info.a} ${info.x * side} ${rotY(info) * ht})`;
  } else {
    return `rotate(180, ${info.x * side}, ${
      (info.y > 1 ? 1.5 : 0.5) * ht
    }) rotate(${info.a - 180} ${info.x * side} ${rotY(info) * ht})`;
  }
}

// copy triangle from hex to strip
function useHex(info) {
  info.s.appendChild(
    svg(
      "use",
      {
        href: `#hextri${imageIndex(info)}_${triangleIndex(info)}`,
        x: side * (stripX(info) - hexX(info)),
        y: ht * (stripY(info) - hexY(info)),
        transform: rot(info),
      }
      // svg("animateTransform", {
      //   attributeName: "transform",
      //   type: "rotate",
      //   from: `rotate(0, ${info.x * side}, ${rotY(info) * ht})`,
      //   to: `rotate(${info.a}, ${info.x * side}, ${rotY(info) * ht})`,
      //   dur: "10s",
      //   repeatCount: "indefinite",
      // })
    )
  );
  // info.s.appendChild(
  //   svg("circle", {
  //     cx: info.x * side,
  //     cy: info.y * ht,
  //     r: 2,
  //     fill: "red",
  //   })
  // );
}

function hex_to_strip() {
  text_labels.forEach(useHex);
  // for (let i = 24; i < 30; i++) {
  //   useHex(text_labels[i]);
  // }
}

drawLines();
addText();
prepDefs();
draw_hex();
subscribe_events();
hex_to_strip();
// chooseImage();

console.log("done");
