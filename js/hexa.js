import { html, svg, $, $$, listen, setAttributes } from "./dom.js";

const SVGINCH = 96;
const PNGINCH = 300;
const PAPERWIDTH = 10; // inches, subtracting 1/2" from each side for printer margin
const SVGWIDTH = PAPERWIDTH * SVGINCH; // 960 - SVG uses 96 "pixels" per inch by default
const PNGWIDTH = PAPERWIDTH * PNGINCH; // 3000 -  Use 300 dpi as our best-guess for PNG export

const side = SVGWIDTH / 6; // 160
const ht = (side * Math.sqrt(3)) / 2; // 138.56406460551017
const pngHeight = (ht / SVGINCH) * PNGINCH;
const SVGSTRIPHEIGHT = ht * 2;
const PNGSTRIPHEIGHT = pngHeight * 2;
const PAPERHEIGHT = 7.5; // inches, subtracting 1/2" from each side for printer margin
const SVGFULLHEIGHT = PAPERHEIGHT * SVGINCH; // 720
const PNGFULLHEIGHT = PAPERHEIGHT * PNGINCH; // 2250

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

//const YOFF = SVGSTRIPHEIGHT + SVGINCH;
// instead of using an inch between strips, use ht
const y1 = 0.33;
const y2 = 0.66;
const y3 = 1.33;
const y4 = 1.66;
const y5 = 3.33;
const y6 = 3.66;
const y7 = 4.33;
const y8 = 4.66;

// text and rotations for strips
// key: t=text, a=angle of rotation, x,y centerpoint
const textLabels = [
  { t: "1a", a: 120, x: 3.5, y: y2 },
  { t: "1b", a: 120, x: 2, y: y1 },
  { t: "1c", a: 0, x: 0.5, y: y2 },
  { t: "1d", a: 0, x: 3, y: y5 },
  { t: "1e", a: -120, x: 1.5, y: y6 },
  { t: "1f", a: -120, x: 5, y: y1 },
  { t: "2a", a: 180, x: 4, y: y1 },
  { t: "2b", a: 60, x: 2.5, y: y2 },
  { t: "2c", a: 60, x: 1, y: y1 },
  { t: "2d", a: -60, x: 3.5, y: y6 },
  { t: "2e", a: -60, x: 2, y: y5 },
  { t: "2f", a: 180, x: 0.5, y: y6 },
  { t: "3a", a: 120, x: 4.5, y: y2 },
  { t: "3b", a: 120, x: 3, y: y1 },
  { t: "3c", a: 0, x: 1.5, y: y1 },
  { t: "3d", a: 0, x: 4, y: y5 },
  { t: "3e", a: -120, x: 2.5, y: y6 },
  { t: "3f", a: -120, x: 1, y: y5 },
  { t: "4a", a: 180, x: 1.5, y: y3 },
  { t: "4b", a: 180, x: 1, y: y4 },
  { t: "4c", a: 60, x: 2.5, y: y7 },
  { t: "4d", a: 60, x: 2, y: y8 },
  { t: "4e", a: -60, x: 4.5, y: y3 },
  { t: "4f", a: -60, x: 4, y: y4 },
  { t: "5a", a: 180, x: 2.5, y: y3 },
  { t: "5b", a: 180, x: 2, y: y4 },
  { t: "5c", a: 60, x: 3.5, y: y7 },
  { t: "5d", a: 60, x: 3, y: y8 },
  { t: "5e", a: -60, x: 5.5, y: y3 },
  { t: "5f", a: -60, x: 5, y: y4 },
  { t: "6a", a: 180, x: 3.5, y: y3 },
  { t: "6b", a: 180, x: 3, y: y4 },
  { t: "6c", a: 60, x: 4.5, y: y7 },
  { t: "6d", a: 60, x: 4, y: y8 },
  { t: "6e", a: -60, x: 1.5, y: y7 },
  { t: "6f", a: -60, x: 1, y: y8 },
];

function defaultImage(hexDefs, idx) {
  loadImage(hexDefs, idx, `images/kaleidoscope${idx}.png`);
}

function loadImage(hexDefs, idx, url) {
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
    image.decode().then(() => renderImage(hexDefs, idx, image));
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

function renderImage(hexDefs, idx, img) {
  images[idx] = new HexImage(img);
  images[idx].center();
  let oldImg = $(`#image${idx}`);
  if (oldImg) {
    oldImg.remove();
  }
  img.id = `image${idx}`;
  hexDefs.appendChild(img);
}

function addHexDefs(s) {
  let h = svg("defs");
  s.appendChild(h);
  n6.forEach(idx => defaultImage(h, idx));
  return h;
}

function addText(s) {
  textLabels.forEach(info => textObj(s, info));
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
  } else if (info.y < 2) {
    return 1;
  } else if (info.y < 4) {
    return 3;
  } else {
    return 4;
  }
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

const textObj = (s, o) => text(s, o.t, o.x, o.y, o.a);

function text(s, txt, x, y, rotation) {
  s.appendChild(
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

function triClip(defs, num, p1, p2, p3) {
  defs.appendChild(
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

function drawHex(h) {
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
    h.appendChild(g);
  }
}

function prepDefs(s) {
  let defs = addHexDefs(s);
  triClip(defs, 1, p1, p2, p0);
  triClip(defs, 2, p2, p3, p0);
  triClip(defs, 3, p3, p4, p0);
  triClip(defs, 4, p4, p5, p0);
  triClip(defs, 5, p5, p6, p0);
  triClip(defs, 6, p6, p1, p0);
}

function M(x, y, yOffP) {
  lastMoveWasMove = true;
  return `M${x * side} ${y * ht + (yOffP ? YOFF : 0)} `;
}

function L(x, y, yOffP) {
  let returnVal;
  if (lastMoveWasMove) {
    returnVal = `L${x * side} ${y * ht + (yOffP ? YOFF : 0)} `;
  } else {
    returnVal = `${x * side} ${y * ht + (yOffP ? YOFF : 0)} `;
  }
  lastMoveWasMove = false;
  return returnVal;
}

function drawLines(strips) {
  // cutting lines
  path(
    strips,
    [
      M(0.5, 2),
      L(0, 1),
      L(0.5, 0),
      L(5.5, 0),
      L(6, 1),
      L(5.5, 2),
      L(0.5, 2),
      M(0.5, 5),
      L(0, 4),
      L(0.5, 3),
      L(4.5, 3),
      L(5, 4),
      L(4.5, 5),
      L(0.5, 5),
    ],
    "#F00"
    //    "#99C"
  );
  // scoring lines
  path(
    strips,
    [].concat(
      n5.map(n => `${M(n - 0.5, 2)} ${L(n + 0.5, 0)} `),
      `${M(0, 1)} ${L(6, 1)} `,
      n5.map(n => `${M(n - 0.5, 0)} ${L(n + 0.5, 2)} `),
      n4.map(n => `${M(n - 0.5, 5)} ${L(n + 0.5, 3)} `),
      `${M(0, 4)} ${L(5, 4)} `,
      n4.map(n => `${M(n - 0.5, 3)} ${L(n + 0.5, 5)} `)
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
  loadImage($("#hex defs"), currImageIdx, canvas.toDataURL("image/jpeg"));
}

function chooseImage() {
  let idx = parseInt($("input[type=radio]:checked").value, 10); // target values are 1-based
  currImageIdx = idx;
  hex.viewBox.baseVal.x = 350 * (idx - 1);
}

async function downloadFile() {
  // create a canvas element
  let canvas = html("canvas", { width: PNGWIDTH, height: PNGFULLHEIGHT });
  let ctx = canvas.getContext("2d");
  let strips = $("#strips");
  let s1 = strips.cloneNode(true);
  let paths = $$("path");
  paths.forEach(path => path.remove());
  let svgImage = await inlineSVGToImage(s1);
  ctx.drawImage(
    svgImage,
    0,
    0,
    SVGWIDTH,
    SVGFULLHEIGHT,
    0,
    0,
    PNGWIDTH,
    PNGFULLHEIGHT
  );
  // convert it to a base-64 encoded URL
  let imgURL = canvas.toDataURL();
  // $("#test").setAttribute("src", imgURL);
  // use it as an image in a new SVG element
  // draw the cutting and scoring lines in SVG
  let baseSVG = `<?xml version="1.0" standalone="yes"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${SVGWIDTH}" height="${SVGFULLHEIGHT}" viewBox="0 0 ${SVGWIDTH} ${SVGFULLHEIGHT}" xmlns="http://www.w3.org/2000/svg" version="1.1"><image x="0" y="0" width="${SVGWIDTH}" height="${
    SVGFULLHEIGHT * 2 + 96
  }" href="${imgURL}"/> ${paths.map(path => path.outerHTML).join("")}</svg>`;
  // save
  save(baseSVG);
}

function inlineSVGToImage(svgElement) {
  return new Promise(resolve => {
    let svgURL = new XMLSerializer().serializeToString(svgElement);
    let img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.src = "data:image/svg+xml; charset=utf8, " + encodeURIComponent(svgURL);
    $("#test").src = img.src;
  });
}

function save(data) {
  console.log("saving");
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
    console.log("should be saved");
  };
  reader.readAsDataURL(new Blob([data], { type: "image/svg+xml" }));
}

function subscribeEvents() {
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
  fileReader.onload = evt =>
    loadImage($("#hex defs"), currImageIdx, fileReader.result);
  fileReader.readAsDataURL(evt.target.files[0]);
}

function dropFile(evt) {
  if (evt.dataTransfer.files.length === 0) {
    return;
  }
  evt.preventDefault();
  let fileReader = new FileReader();
  fileReader.onload = evt =>
    loadImage($("#hex defs"), currImageIdx, fileReader.result);
  fileReader.readAsDataURL(evt.dataTransfer.files[0]);
}

function rotY(info) {
  // FIXME for drawing all images into one SVG
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
function useHex(strips, info) {
  strips.appendChild(
    svg("use", {
      href: `#hextri${imageIndex(info)}_${triangleIndex(info)}`,
      x: side * (stripX(info) - hexX(info)),
      y: ht * (stripY(info) - hexY(info)),
      transform: rot(info),
    })
  );
}

function hexToStrips(strips) {
  textLabels.forEach(info => useHex(strips, info));
}

function gluingHints(strips) {
  // Show which triangles get glued together at the end
  textObj(strips, { t: "B", a: 0, x: 0.5, y: y3 });
  textObj(strips, { t: "A", a: 0, x: 5.5, y: y2 });
  textObj(strips, { t: "a", a: 0, x: 0.5, y: y7 });
  textObj(strips, { t: "b", a: 0, x: 4.5, y: y6 });
}

function drawAll() {
  let hex = $("#hex");
  let strips = svg("svg", {
    id: "strips",
    viewBox: `-1 -1 ${SVGWIDTH} ${SVGFULLHEIGHT}`,
  });
  document.body.append(strips);
  drawImages(strips, hex);
  drawLines(strips);
  subscribeEvents();
  chooseImage();
}

function drawImages(strips, hex) {
  addText(strips);
  prepDefs(strips);
  drawHex(hex);
  hexToStrips(strips);
  gluingHints(strips);
}

drawAll();

console.log("done");
