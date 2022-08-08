import { html, svg, $, $$, listen } from "./dom.js";

const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...

const strip1 = $("#strip1");
const strip2 = $("#strip2");
const hex = $("#hex");
let hexDefs;
let lastMoveWasMove = false;
let dragging = false;

let images = [];
let image;
let currImageIdx = 1;
const video = $("#video");
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");
let cameraInitialized = false;

const n4 = [1, 2, 3, 4];
const n5 = [1, 2, 3, 4, 5];
const n6 = [1, 2, 3, 4, 5, 6];

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
  { t: "1a", s: strip1, a: 120, x: 3.5, y: 0.66 },
  { t: "1b", s: strip1, a: 120, x: 2, y: 0.33 },
  { t: "1c", s: strip1, a: 0, x: 0.5, y: 0.66 },
  { t: "1d", s: strip2, a: 0, x: 3, y: 0.33 },
  { t: "1e", s: strip2, a: -120, x: 1.5, y: 0.66 },
  { t: "1f", s: strip1, a: -120, x: 5, y: 0.33 },
  { t: "2a", s: strip1, a: 180, x: 4, y: 0.33 },
  { t: "2b", s: strip1, a: 60, x: 2.5, y: 0.66 },
  { t: "2c", s: strip1, a: 60, x: 1, y: 0.33 },
  { t: "2d", s: strip2, a: -60, x: 3.5, y: 0.66 },
  { t: "2e", s: strip2, a: -60, x: 2, y: 0.33 },
  { t: "2f", s: strip2, a: 180, x: 0.5, y: 0.66 },
  { t: "3a", s: strip1, a: 120, x: 4.5, y: 0.66 },
  { t: "3b", s: strip1, a: 120, x: 3, y: 0.33 },
  { t: "3c", s: strip1, a: 0, x: 1.5, y: 0.66 },
  { t: "3d", s: strip2, a: 0, x: 4, y: 0.33 },
  { t: "3e", s: strip2, a: -120, x: 2.5, y: 0.66 },
  { t: "3f", s: strip2, a: -120, x: 1, y: 0.33 },
  { t: "4a", s: strip1, a: 180, x: 1.5, y: 1.33 },
  { t: "4b", s: strip1, a: 180, x: 1, y: 1.66 },
  { t: "4c", s: strip2, a: 60, x: 2.5, y: 1.33 },
  { t: "4d", s: strip2, a: 60, x: 2, y: 1.66 },
  { t: "4e", s: strip1, a: -60, x: 4.5, y: 1.33 },
  { t: "4f", s: strip1, a: -60, x: 4, y: 1.66 },
  { t: "5a", s: strip1, a: 180, x: 2.5, y: 1.33 },
  { t: "5b", s: strip1, a: 180, x: 2, y: 1.66 },
  { t: "5c", s: strip2, a: 60, x: 3.5, y: 1.33 },
  { t: "5d", s: strip2, a: 60, x: 3, y: 1.66 },
  { t: "5e", s: strip1, a: -60, x: 5.5, y: 1.33 },
  { t: "5f", s: strip1, a: -60, x: 5, y: 1.66 },
  { t: "6a", s: strip1, a: 180, x: 3.5, y: 1.33 },
  { t: "6b", s: strip1, a: 180, x: 3, y: 1.66 },
  { t: "6c", s: strip2, a: 60, x: 4.5, y: 1.33 },
  { t: "6d", s: strip2, a: 60, x: 4, y: 1.66 },
  { t: "6e", s: strip2, a: -60, x: 1.5, y: 1.33 },
  { t: "6f", s: strip2, a: -60, x: 1, y: 1.66 },
];

function defaultImage(idx) {
  loadImage(idx, `images/kaleidoscope${idx}.png`);
}

function loadImage(idx, url) {
  let img = new Image();
  img.src = url;
  img.decode().then(() => {
    if (!url.startsWith("data:")) {
      url = encodeURLForImage(img);
    }
    let image = svg("image", {
      href: url,
      width: img.naturalWidth,
      height: img.naturalHeight,
      x: 0,
      y: 0,
    });
    image.decode().then(() => renderImage(idx, image));
  });
  return img;
}

function encodeURLForImage(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  // Copy the image contents to the canvas
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function renderImage(idx, img) {
  images[idx] = new HexImage(img);
  images[idx].center();
  let oldImg = $(`#image${idx}`);
  if (oldImg) {
    oldImg.remove();
  }
  img.id = `image${idx}`;
  hexDefs.appendChild(img);
}

function addHexDefs() {
  hexDefs = svg("defs");
  strip1.appendChild(hexDefs);
  n6.forEach(defaultImage);
}

function addText() {
  text_labels.forEach(textObj);
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

function line(strip, x1, y1, x2, y2, clr) {
  strip.appendChild(
    svg("line", {
      x1: x1 * side,
      y1: y1 * ht,
      x2: x2 * side,
      y2: y2 * ht,
      stroke: clr || "#CCC",
    })
  );
}

function path(strip, moves, clr) {
  strip.appendChild(
    svg("path", {
      d: moves.join(" "),
      stroke: clr || "#CCC",
      fill: "none",
    })
  );
}

function dot(strip, x, y, r, clr) {
  strip.appendChild(
    svg("circle", {
      cx: x * side,
      cy: y * ht,
      r: r || 3,
      fill: clr || "#F00",
    })
  );
}

const textObj = o => text(o.s, o.t, o.x, o.y, o.a);

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

function M(x, y) {
  lastMoveWasMove = true;
  return `M${x * side} ${y * ht} `;
}

function L(x, y) {
  let returnVal;
  if (lastMoveWasMove) {
    returnVal = `L${x * side} ${y * ht} `;
  } else {
    returnVal = `${x * side} ${y * ht} `;
  }
  lastMoveWasMove = false;
  return returnVal;
}

function drawLines() {
  // cutting lines
  path(
    strip1,
    [M(0.5, 2), L(0, 1), L(0.5, 0), L(5.5, 0), L(6, 1), L(5.5, 2), L(0.5, 2)],
    "#99C"
  );
  path(
    strip2,
    [M(0.5, 2), L(0, 1), L(0.5, 0), L(4.5, 0), L(5, 1), L(4.5, 2), L(0.5, 2)],
    "#99C"
  );
  // scoring lines
  path(
    strip1,
    n5
      .map(n => `${M(n - 0.5, 2)} ${L(n + 0.5, 0)} `)
      .concat(
        `${M(0, 1)} ${L(6, 1)} `,
        n5.map(n => `${M(n - 0.5, 0)} ${L(n + 0.5, 2)}`)
      )
  );
  path(
    strip2,
    n4
      .map(n => `${M(n - 0.5, 2)} ${L(n + 0.5, 0)} `)
      .concat(
        `${M(0, 1)} ${L(5, 1)} `,
        n4.map(n => `${M(n - 0.5, 0)} ${L(n + 0.5, 2)}`)
      )
  );
}

class HexImage {
  constructor(img) {
    this.image = img;
    this.originalWidth = this.image.width.baseVal.value;
    this.originalHeight = this.image.height.baseVal.value;
    this._scale = 1;
  }
  center() {
    // scale and position image
    this.scale = 350 / Math.min(this.width, this.height);
    if (this.width > 350) {
      this.x = -(this.width - 350) / 2;
    }
    if (this.height > 300) {
      this.y = -(this.height - 300) / 2;
    }
  }
  get x() {
    return Number(this.image.getAttribute("x"));
  }
  set x(val) {
    this.image.setAttribute("x", val);
  }
  get y() {
    return Number(this.image.getAttribute("y"));
  }
  set y(val) {
    this.image.setAttribute("y", val);
  }
  get width() {
    return Number(this.image.getAttribute("width"));
  }
  set width(val) {
    this.image.setAttribute("width", val);
  }
  get height() {
    return Number(this.image.getAttribute("height"));
  }
  set height(val) {
    this.image.setAttribute("height", val);
  }
  get scale() {
    return this._scale;
  }
  set scale(val) {
    this._scale = val;
    this.width = this.originalWidth * this.scale;
    this.height = this.originalHeight * this.scale;
  }
}

function initializeCamera(callback) {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(mediaStream => {
      video.srcObject = mediaStream;
      const track = mediaStream.getVideoTracks()[0];
      cameraInitialized = true;
      console.log("camera ready");
      callback();
    })
    .catch(err => {
      console.error(err);
      $("#take-photo").remove();
    });
}

function takePhoto() {
  if (!cameraInitialized) {
    initializeCamera(takePhoto);
    return;
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  loadImage(currImageIdx, canvas.toDataURL("image/jpeg"));
}

function chooseImage() {
  let idx = parseInt($("input[type=radio]:checked").value, 10); // target values are 1-based
  currImageIdx = idx;
  hex.viewBox.baseVal.x = 350 * (idx - 1);
}

function subscribe_events() {
  listen("input[type=radio]", "input", chooseImage);
  $("#hex").addEventListener("wheel", scrollToZoom, { passive: false });
  listen("#hex", "mousedown", evt => {
    evt.preventDefault();
    dragging = true;
  });
  listen(document, "mousemove", dragToPan);
  listen(window, "mouseup", () => (dragging = false));
  listen("#hex", "dragover", evt => evt.preventDefault());
  listen("#hex", "drop", dropFile);
  listen("#take-photo", "click", takePhoto);
  listen("#filepicker", "change", loadFile);
}

function scrollToZoom(evt) {
  evt.preventDefault();
  images[currImageIdx].scale *= evt.deltaY > 0 ? 1.2 : 0.8;
}

function dragToPan(evt) {
  if (!dragging) return;
  evt.preventDefault();
  images[currImageIdx].x += evt.movementX;
  images[currImageIdx].y += evt.movementY;
}

function loadFile(evt) {
  if (!evt.target.files.length) {
    return;
  }
  let fileReader = new FileReader();
  fileReader.onload = evt => loadImage(currImageIdx, fileReader.result);
  fileReader.readAsDataURL(evt.target.files[0]);
}

function dropFile(evt) {
  if (evt.dataTransfer.files.length === 0) {
    return;
  }
  evt.preventDefault();
  let fileReader = new FileReader();
  fileReader.onload = evt => loadImage(currImageIdx, fileReader.result);
  fileReader.readAsDataURL(evt.dataTransfer.files[0]);
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
    svg("use", {
      href: `#hextri${imageIndex(info)}_${triangleIndex(info)}`,
      x: side * (stripX(info) - hexX(info)),
      y: ht * (stripY(info) - hexY(info)),
      transform: rot(info),
    })
  );
}

function hex_to_strip() {
  text_labels.forEach(useHex);
}

function gluingHints() {
  // Show which triangles get glued together at the end
  textObj({ t: "B", s: strip1, a: 0, x: 0.5, y: 1.33 });
  textObj({ t: "A", s: strip1, a: 0, x: 5.5, y: 0.66 });
  textObj({ t: "a", s: strip2, a: 0, x: 0.5, y: 1.33 });
  textObj({ t: "b", s: strip2, a: 0, x: 4.5, y: 0.66 });
}

addText();
prepDefs();
draw_hex();
subscribe_events();
hex_to_strip();
drawLines();
gluingHints();
chooseImage();

console.log("done");
