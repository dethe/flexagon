// Map images to the faces of a hexahexaflexagon
// Change the images on the next line of code to change the mapping. Try to keep an aspect ratio close to 2.9 / 2.5

const img_urls = [
    "pixelated.png",
    "bcit.png",
    "grace.png",
    "maker_ed.png",
    "participedia.jpg",
    "modernjive.png"
];

const INSET = 30;

const backgrounds = ["#48445B", "teal", "white", "white", "black", "black"];

const text = [
    [
        "Dethe Elza",
        "Æsthetic Programmer",
        "dethe@livingcode.org",
        "http://livingcode.org/",
        "@dethe",
        null
    ],
    [
        "https://bcit.ca/",
        null,
        "School of Business",
        null,
        "dethe@bcit.ca",
        null
    ],
    [
        "Waterbear",
        "Programming for humans",
        "http://waterbearlang.com/",
        "waterbear@waterbearlang.com",
        "@waterbearlang",
        null
    ],
    [
        "Maker Education",
        "BUILD | LEARN | HACK | TEACH",
        null,
        "http://goo.gl/5XeKJn",
        "@VanMakerFdn",
        "#MakerEdBC"
    ],
    [
        "Participedia",
        null,
        "Democratic Participation",
        null,
        "http://participedia.net/",
        null
    ],
    [
        "Modern Jive Vancouver",
        "Come learn to dance",
        "Thursdays at 7:30 pm",
        "Cambrian Welsh Hall",
        "215 East 17th St.",
        "http://modernjivevancouver.com"
    ]
];

var canvas1 = document.getElementById("c1");
var ctx1 = canvas1.getContext("2d");
var canvas2 = document.getElementById("c2");
var ctx2 = canvas2.getContext("2d");
var canvas3 = document.getElementById("c3");
var ctx3 = canvas3.getContext("2d");
var canvas4 = document.getElementById("c4");
var ctx4 = canvas4.getContext("2d");

var ratio = Math.sqrt(3) / 2; //  hex side * ratio == hex height
var size = 145;
var fsize = size * ratio;
var hex_width = fsize * 2;
var hex_height = size * 2;
var dX = (hex_height - hex_width) / 2;

var hx = [0, size / 2, size, 3 * size / 2, size * 2];
var hy = [dX, fsize + dX, size * ratio * 2 + dX];
var hcx = hx[2];
var hcy = hx[1];

// Initialize x,y offsets for triangle strips
var x = [];
var y = [0, fsize, fsize + 50, 2 * fsize + 50];
//var y = [0, fsize, fsize + 100, fsize * 2 + 100];
for (var i = 0; i < 12; i++) {
    x.push(i * (size / 2));
}

// hold the wedge canvases grouped by image, getWedges will return them ordered for triangle strips
var images = [];

// Resize target canvases for building triangle strips
resize(canvas1, x[11], y[3]);
resize(canvas2, x[11], y[3]);
resize(canvas3, x[11], y[3]);
resize(canvas4, x[11], y[3]);

function triangle(ctx, x1, y1, x2, y2, x3, y3) {
    // create path for a triangle
    // Used both for drawing triangles, and for cropping to them
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    triangle(ctx, x1, y1, x2, y2, x3, y3);
    ctx.stroke();
    ctx.restore();
}

// Create a canvas element and return it. This canvas will not be printed
function getCanvas(width, height) {
    var canvas = document.createElement("canvas");
    document.querySelector(".hexes").appendChild(canvas);
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    canvas.setAttribute("class", "noprint");
    return canvas;
}

// Create a canvas holding one wedge pointing up
function wedgeUp(src) {
    var dest = getCanvas(size, fsize);
    var ctx = dest.getContext("2d");
    triangle(ctx, 0, fsize, size / 2, 0, size, fsize);
    ctx.clip();
    ctx.drawImage(src, 0, dX, size, fsize, 0, 0, size, fsize);
    return dest;
}

// Create a canvas with one wedge pointing down
function wedgeDown(src, offside) {
    var dest = getCanvas(size, fsize);
    var ctx = dest.getContext("2d");
    triangle(ctx, 0, 0, size / 2, fsize, size, 0);
    ctx.clip();
    if (true) {
        ctx.drawImage(src, 0, dX + fsize, size, fsize, 0, 0, size, fsize);
    } else {
        ctx.drawImage(src, size / 2, dX, size, fsize, 0, 0, size, fsize);
    }
    return dest;
}

// Rotate the canvas (currently only applies to canvas0)
function rotate(ctx, theta) {
    ctx.translate(size, size);
    ctx.rotate(theta);
    ctx.translate(-size, -size);
}

// resize the given canvas
function resize(elem, width, height) {
    elem.setAttribute("width", Math.ceil(width));
    elem.setAttribute("height", Math.ceil(height));
}

function hexPoints(width, height) {
    var points = [];
    var cx = width / 2;
    var cy = height / 2;
    var r = Math.min(cx, cy);
    var angle = Math.PI / 3;
    var x, y;
    for (var i = 0; i < 6; i++) {
        x = Math.cos(angle * i) * r + cx;
        y = Math.sin(angle * i) * r + cy;
        points.push([x, y]);
    }
    return points;
}

function hex(ctx, width, height) {
    var points = hexPoints(width, height);
    ctx.beginPath();
    ctx.moveTo(points[5][0], points[5][1]);
    points.forEach(function(pt) {
        ctx.lineTo(pt[0], pt[1]);
    });
}

function hexcross(ctx, width, height) {
    var points = hexPoints(width, height);
    ctx.beginPath();
    for (var i = 0; i < 3; i++) {
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[i + 3][0], points[i + 3][1]);
    }
}

function drawHex(ctx) {
    ctx.save();
    ctx.strokeStyle = "#CCC";
    hex(ctx, size * 2, size * 2);
    ctx.stroke();
    ctx.restore();
}

function drawHexcross(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = "#CCC";
    hexcross(ctx, width, height);
    ctx.stroke();
    ctx.restore();
}

// This is where the action is. For each url in 'img_urls' load the image and slice it into wedges
// Each wedge will be on it's own canvas
// Once all images are loaded and sliced, call 'mapImagesToStrip()' to lay them out on the triangle strips

function sliceAndDice(canvas, img, idx) {
    var ctx = canvas.getContext("2d");
    var slices = [];
    images[idx] = slices;
    ctx.save();
    var img_ratio = img.height / img.width;
    var img_height, img_width, dx, dy;
    if (img_ratio < ratio) {
        // image is wider than hex
        img_height = img.height;
        img_width = img_height * ratio;
        dx = (img.width - img_width) / 2;
        dy = 0;
    } else {
        img_width = img.width;
        img_height = img_width / ratio;
        dy = (img.height - img_height) / 2;
        dx = 0;
    }
    for (var i = 0; i < 3; i++) {
        // rotate into position to grab two wedges
        rotate(ctx, -Math.PI / 3 * 2);
        // grab the 6 wedges, 2 at a time
        ctx.clearRect(0, 0, hex_height, hex_height);
        // clip to full hex
        hex(ctx, size * 2, size * 2);
        ctx.stroke();
        // fill inset hex with background
        ctx.save();
        ctx.translate(INSET, INSET);
        hex(ctx, size * 2 - INSET * 2, size * 2 - INSET * 2);
        ctx.clip();
        hex(ctx, size * 2 - INSET * 2, size * 2 - INSET * 2);
        // ctx.fillStyle = backgrounds[idx];
        // ctx.fill();
        // draw image
        ctx.drawImage(
            img,
            -dx,
            -dy,
            img_width,
            img_height,
            -dX + 10,
            10,
            hex_width,
            hex_height
        );
        ctx.restore();
        drawText(ctx, idx, i * 2);
        slices.push(wedgeUp(canvas));
        slices.push(wedgeDown(canvas));
        // rotate(ctx, -Math.PI / 3);
        // drawText(ctx, idx, i * 2 + 1);
    }
    drawHexcross(ctx, size * 2, size * 2);
    ctx.restore();
}

function drawText(ctx, idx, i) {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = "10px Helvetica";
    let str = text[idx][i];
    if (str) {
        ctx.fillText(str, hex_width / 2 + INSET / 2, hex_height - INSET);
    }
    rotate(ctx, Math.PI / 3);
    str = text[idx][i + 1];
    if (str) {
        ctx.fillText(str, hex_width / 2 + INSET / 2, hex_height - INSET);
    }
    ctx.restore();
}

function loadImage(idx) {
    var img = new Image();
    img.onload = function() {
        var canvas0 = getCanvas(size * 2, size * 2);
        canvas0.className = "noprint heximage";
        canvas0.dataset.index = idx;
        sliceAndDice(canvas0, img, idx);
        if (idx + 1 < 6) {
            loadImage(idx + 1);
        } else {
            mapImagesToStrip();
        }
    };
    img.src = "img/" + img_urls[idx];
}
// Kick it off
loadImage(0);

function initWedges() {
    // Requires all wedge images to exist, so all images have to be loaded and sliced into the 'images' array
    var wedges = [
        //front
        null,
        images[0][0],
        images[0][1],
        images[1][0],
        images[1][1],
        images[2][0],
        images[2][1],
        images[0][2],
        images[0][3],
        images[1][2],
        null,
        images[1][3],
        images[2][2],
        images[2][3],
        images[0][4],
        images[0][5],
        images[1][4],
        images[1][5],
        images[2][4],
        images[2][5],
        // back
        null,
        images[3][3], // images[3][0],
        images[4][0],
        images[5][3], // images[5][0],
        images[3][4], // images[3][1],
        images[4][1],
        images[5][4], // images[5][1],
        images[3][5], // images[3][2],
        images[4][2],
        images[5][5], // images[5][2],
        null,
        images[3][0], // images[3][3],
        images[4][3],
        images[5][0], // images[5][3],
        images[3][1], // images[3][4],
        images[4][4],
        images[5][1], // images[5][4],
        images[3][2], // images[3][5],
        images[4][5],
        images[5][2] // images[5][5]
    ];
    return wedges;
}

function drawWedge(ctx, x, y, wedge) {
    if (wedge) {
        ctx.drawImage(wedge, x, y);
    }
}

function mapImagesToStrip() {
    var wedges = initWedges();
    ctx1.strokeRect(0, 0, x[11], y[3]);
    ctx2.strokeRect(0, 0, x[11], y[3]);
    ctx3.strokeRect(0, 0, x[11], y[3]);
    ctx4.strokeRect(0, 0, x[11], y[3]);
    [ctx1, ctx2].forEach(function(cx) {
        for (var j = 0; j < 10; j++) {
            drawWedge(cx, x[j], 0, wedges[j]);
            drawWedge(cx, x[j], 50 + fsize, wedges[j + 10]);
            drawTriangle(
                cx,
                x[j],
                y[j % 2],
                x[j + 1],
                y[(j + 1) % 2],
                x[j + 2],
                y[j % 2],
                "#CCC"
            );
            drawTriangle(
                cx,
                x[j],
                y[(j + 1) % 2 + 2],
                x[j + 1],
                y[j % 2 + 2],
                x[j + 2],
                y[(j + 1) % 2 + 2],
                "#CCC"
            );
        }
        cx.save();
        cx.font = "48pt Helvetica";
        cx.strokeStyle = "rgba(100,100,100,.25)";
        cx.strokeText("A", 50, 70);
        cx.strokeText("B", 50, 275);
        cx.restore();
    });
    [ctx3, ctx4].forEach(function(cx) {
        for (var j = 0; j < 10; j++) {
            drawWedge(cx, x[j], 0, wedges[j + 20]);
            drawWedge(cx, x[j], 50 + fsize, wedges[j + 30]);
            drawTriangle(
                cx,
                x[j],
                y[(j + 1) % 2],
                x[j + 1],
                y[j % 2],
                x[j + 2],
                y[(j + 1) % 2],
                "#CCC"
            );
            drawTriangle(
                cx,
                x[j],
                y[j % 2 + 2],
                x[j + 1],
                y[(j + 1) % 2 + 2],
                x[j + 2],
                y[j % 2 + 2],
                "#CCC"
            );
        }
        cx.save();
        cx.font = "48pt Helvetica";
        cx.strokeStyle = "rgba(100,100,100,.25)";
        cx.strokeText("B", 50, 100);
        cx.strokeText("A", 50, 240);
        cx.restore();
    });
}
