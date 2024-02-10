import { html, svg, $, $$, listen, setAttributes } from "./dom.js";

const side = 172; // 10 triangles across 1250 pixels
const ht = 149; // height of triangle, 108.2531...
const side_2 = Math.round(side / 2);
const ht_2 = Math.round(ht / 2);

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
let optionalText = [[], [], [], [], [], []];

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
// a2= angle of rotation for optional edge text
const text_labels = [
  { t: "1a", s: strip1, a: 120, a2: -120, x: 3.5, y: 0.66 },
  { t: "1b", s: strip1, a: 120, a2: -60, x: 2, y: 0.33 },
  { t: "1c", s: strip1, a: 0, a2: -120, x: 0.5, y: 0.66 },
  { t: "1d", s: strip2, a: 0, a2: -60, x: 3, y: 0.33 },
  { t: "1e", s: strip2, a: -120, a2: -120, x: 1.5, y: 0.66 },
  { t: "1f", s: strip1, a: -120, a2: -60, x: 5, y: 0.33 },
  { t: "2a", s: strip1, a: 180, a2: -60, x: 4, y: 0.33 },
  { t: "2b", s: strip1, a: 60, a2: -120, x: 2.5, y: 0.66 },
  { t: "2c", s: strip1, a: 60, a2: -60, x: 1, y: 0.33 },
  { t: "2d", s: strip2, a: -60, a2: -120, x: 3.5, y: 0.66 },
  { t: "2e", s: strip2, a: -60, a2: -60, x: 2, y: 0.33 },
  { t: "2f", s: strip2, a: 180, a2: 120, x: 0.5, y: 0.66 },
  { t: "3a", s: strip1, a: 120, a2: -120, x: 4.5, y: 0.66 },
  { t: "3b", s: strip1, a: 120, a2: -60, x: 3, y: 0.33 },
  { t: "3c", s: strip1, a: 0, a2: -120, x: 1.5, y: 0.66 },
  { t: "3d", s: strip2, a: 0, a2: -60, x: 4, y: 0.33 },
  { t: "3e", s: strip2, a: -120, a2: -120, x: 2.5, y: 0.66 },
  { t: "3f", s: strip2, a: -120, a2: -60, x: 1, y: 0.33 },
  { t: "4a", s: strip1, a: 180, a2: -60, x: 1.5, y: 1.33 },
  { t: "4b", s: strip1, a: 180, a2: 0, x: 1, y: 1.66 },
  { t: "4c", s: strip2, a: 60, a2: -60, x: 2.5, y: 1.33 },
  { t: "4d", s: strip2, a: 60, a2: 0, x: 2, y: 1.66 },
  { t: "4e", s: strip1, a: -60, a2: -60, x: 4.5, y: 1.33 },
  { t: "4f", s: strip1, a: -60, a2: 0, x: 4, y: 1.66 },
  { t: "5a", s: strip1, a: 180, a2: -60, x: 2.5, y: 1.33 },
  { t: "5b", s: strip1, a: 180, a2: 0, x: 2, y: 1.66 },
  { t: "5c", s: strip2, a: 60, a2: -60, x: 3.5, y: 1.33 },
  { t: "5d", s: strip2, a: 60, a2: 0, x: 3, y: 1.66 },
  { t: "5e", s: strip1, a: -60, a2: -60, x: 5.5, y: 1.33 },
  { t: "5f", s: strip1, a: -60, a2: 0, x: 5, y: 1.66 },
  { t: "6a", s: strip1, a: 180, a2: -60, x: 3.5, y: 1.33 },
  { t: "6b", s: strip1, a: 180, a2: 0, x: 3, y: 1.66 },
  { t: "6c", s: strip2, a: 60, a2: -60, x: 4.5, y: 1.33 },
  { t: "6d", s: strip2, a: 60, a2: 0, x: 4, y: 1.66 },
  { t: "6e", s: strip2, a: -60, a2: -60, x: 1.5, y: 1.33 },
  { t: "6f", s: strip2, a: -60, a2: 0, x: 1, y: 1.66 },
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

// function line(strip, x1, y1, x2, y2, clr) {
//   strip.appendChild(
//     svg("line", {
//       x1: x1 * side,
//       y1: y1 * ht,
//       x2: x2 * side,
//       y2: y2 * ht,
//       stroke: clr || "#CCC",
//     })
//   );
// }

function path(strip, moves, clr) {
  strip.appendChild(
    svg("path", {
      d: moves.join(" "),
      stroke: clr || "#CCC",
      fill: "none",
    })
  );
}

// function dot(strip, x, y, r, clr) {
//   strip.appendChild(
//     svg("circle", {
//       cx: x * side,
//       cy: y * ht,
//       r: r || 3,
//       fill: clr || "#F00",
//     })
//   );
// }

const textObj = o => text(o.s, o.t, o.x, o.y, o.a, o.a2);

function text(strip, txt, x, y, rotation, textRotation, neverHide) {
  let _x = x * side;
  let _y = y * ht;
  let inset = 8;
  let _h = 6;
  strip.appendChild(
    svg(
      "text",
      {
        x: _x,
        y: _y,
        fill: "#CCC",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "font-size": "2em",
        "font-family": "sans-serif",
        class: neverHide ? "never_hide" : "",
        transform: `rotate(${rotation}, ${_x}, ${_y})`,
      },
      txt
    )
  );
  if (neverHide) {
    return;
  }
  strip.appendChild(
    svg(
      "g",
      {
        transform: `rotate(${textRotation}, ${x * side}, ${
          y * ht
        }) translate(0, ${ht / 3.4})`,
        class: "on_top",
      },
      [
        svg("polygon", {
          fill: "#fff",
          points: `${_x - side_2},${_y + _h} ${_x + side_2},${_y + _h} ${
            _x + (side_2 - inset)
          },${_y - _h} ${_x - (side_2 - inset)},${_y - _h}`,
        }),
        svg(
          "text",
          {
            x: x * side,
            y: y * ht,
            fill: "#000",
            "text-anchor": "middle",
            "font-size": "0.5em",
            "dominant-baseline": "middle",
            id: `text_${txt}`,
          },
          ""
        ),
      ]
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

function letterIndex(num) {
  // convert number to letter. 1 = a, 2 = b, etc.
  return String.fromCharCode(96 + num);
}

function imageIndex(info) {
  // convert number in name to number
  return parseInt(info.t[0], 10);
}

function draw_hex() {
  for (let img = 1; img < 7; img++) {
    let g = svg("g", {
      transform: `translate(${(img - 1) * 350}, 0)`,
    });
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
  restoreOptionalText();
}

function downloadFile() {
  // Save the current hexahexaflexagon as SVG for use with a Cricut
  // 1. Create a namespaced SVG element
  // 2. Copy the SVG of the two strips into the new element
  // 2.a ? Set x,y,width,height for strips
  let s1 = strip1.cloneNode(true);
  let d = s1.querySelector("defs");
  s1.insertBefore(d, s1.firstChild);
  $$("g").forEach(n => d.appendChild(n.cloneNode(true)));
  let s2 = strip2.cloneNode(true);
  setAttributes(s1, { x: 0, y: 0, width: 1034, height: 300 });
  setAttributes(s2, { x: 0, y: 350, width: 1034, height: 300 });
  let baseSVG = `<?xml version="1.0" standalone="yes"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="1034" height="700" viewBox="0 0 1034 700" xmlns="http://www.w3.org/2000/svg" version="1.1">${s1.outerHTML}${s2.outerHTML}</svg>`;
  // 3. Trigger a download (can borrow code from Shimmy)
  save(baseSVG);
}

function save(data) {
  var reader = new FileReader();
  reader.onloadend = function () {
    var a = html("a", {
      href: reader.result,
      download: "hexahexaflexagon.svg",
      target: "_blank",
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  reader.readAsDataURL(new Blob([data], { type: "image/svg+xml" }));
}

function updateSVGText(id, value) {
  let target = document.querySelector(id);
  target.textContent = value;
  if (value) {
    target.parentElement.classList.add("has_text");
  } else {
    target.parentElement.classList.remove("has_text");
  }
}

function updateText(evt) {
  let id = `#text_${currImageIdx}${evt.target.dataset.idx}`;
  let value = evt.target.value.trim();
  updateSVGText(id, value);
  updateOptionalText(evt);
}

function updateOptionalText(evt) {
  let currImageText = optionalText[currImageIdx - 1];
  for (let i = 0; i < 6; i++) {
    currImageText[i] = document.querySelector(`#text${i + 1}`).value.trim();
  }
}

function restoreOptionalText() {
  let currImageText = optionalText[currImageIdx - 1];
  for (let i = 0; i < 6; i++) {
    document.querySelector(`#text${i + 1}`).value = currImageText[i] || "";
  }
}

function repeatText() {
  // copy the text from this face to all the faces
  let currentImageText = optionalText[currImageIdx - 1];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      optionalText[i][j] = currentImageText[j];
      let id = `#text_${i + 1}${letterIndex(j + 1)}`;
      updateSVGText(id, currentImageText[j]);
    }
  }
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
  listen("#download-file", "click", downloadFile);
  listen("input[type=text]", "input", updateText);
  listen("#hide_images", "change", evt =>
    document.body.classList.toggle("hide_images", evt.target.checked)
  );
  listen("#hide_text", "change", evt =>
    document.body.classList.toggle("hide_text", evt.target.checked)
  );
  listen("#copy_text", "click", repeatText);
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
      class: "triangle_image",
      transform: rot(info),
    })
  );
}

function hex_to_strip() {
  text_labels.forEach(useHex);
  // put optional text back on top
  document
    .querySelectorAll(".on_top")
    .forEach(e => e.parentElement.appendChild(e));
}

function gluingHints() {
  // Show which triangles get glued together at the end
  // last param says not to hide these even when text is hidden
  text(strip1, "A", 5.5, 0.66, 0, 0, true);
  text(strip1, "B", 0.5, 1.33, 0, 0, true);
  text(strip2, "a", 0.5, 1.33, 0, 0, true);
  text(strip2, "b", 4.5, 0.66, 0, 0, true);
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
