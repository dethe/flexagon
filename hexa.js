// Map images to the faces of a hexahexaflexagon
// Change the images on the next line of code to change the mapping. Try to keep an aspect ratio close to 2.9 / 2.5

var img_urls = ['clean_coder.png', 'first_in_class.png', 'popcorn.png', 'quick_fixer.png', 'thimble.png', 'hacktivator.png'];


var canvas1 = document.getElementById('c1');
var ctx1 = canvas1.getContext('2d');
var canvas2 = document.getElementById('c2');
var ctx2 = canvas2.getContext('2d');


var factor = 0.8660254037844386; // side * factor == height
var size = 145;
var fsize = size * factor;
var img_width = fsize*2;
var img_height = size*2;
var dX = (img_height - img_width) / 2;

var hx = [0, size/2, size, 3*size/2, size*2];
var hy = [dX, fsize + dX, size*factor*2 + dX];
var hcx = hx[2];
var hcy = hx[1];

// Initialize x,y offsets for triangle strips
var x = [];
var y = [0, fsize, fsize+50, 2*fsize+50];
//var y = [0, fsize, fsize + 100, fsize * 2 + 100];
for (var i = 0; i < 12; i++){
    x.push(i*(size / 2));
}

// hold the wedge canvases grouped by image, getWedges will return them ordered for triangle strips
var images = [];

// Resize target canvases for building triangle strips
resize(canvas1, x[11], y[3]);
resize(canvas2, x[11], y[3]);


function triangle(ctx, x1, y1, x2, y2, x3, y3){
    // create path for a triangle
    // Used both for drawing triangles, and for cropping to them
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x3,y3);
    ctx.closePath();
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color){
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    triangle(ctx, x1, y1, x2, y2, x3, y3);
    ctx.stroke();
    ctx.restore();
}

// Create a canvas element and return it. This canvas will not be printed
function getCanvas(width,height){
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    canvas.setAttribute('class', 'noprint');
    return canvas;
}

// Create a canvas holding one wedge pointing up
function wedgeUp(src){
    var dest = getCanvas(size, fsize);
    var ctx = dest.getContext('2d');
    triangle(ctx, 0,fsize, size/2, 0, size,fsize);
    ctx.clip();
    ctx.drawImage(src, 0, dX, size, fsize, 0, 0, size, fsize);
    return dest;
}

// Create a canvas with one wedge pointing down
function wedgeDown(src, offside){
    var dest = getCanvas(size, fsize);
    var ctx = dest.getContext('2d');
        triangle(ctx, 0,0, size/2, fsize, size,0);
        ctx.clip();
    if (offside){
        ctx.drawImage(src, 0, dX+fsize, size, fsize, 0, 0, size, fsize);
    }else{
        ctx.drawImage(src, size/2, dX, size, fsize, 0, 0, size, fsize);
    }
    return dest;
}

// Rotate the canvas (currently only applies to canvas0)
function rotate(ctx, theta){
    ctx.translate(size, size);
    ctx.rotate(theta);
    ctx.translate(-size, -size);
}

// resize the given canvas
function resize(elem, width,height){
    elem.setAttribute('width', Math.ceil(width));
    elem.setAttribute('height', Math.ceil(height));
}



// This is where the action is. For each url in 'img_urls' load the image and slice it into wedges
// Each wedge will be on it's own canvas
// Once all images are loaded and sliced, call 'mapImagesToStrip()' to lay them out on the triangle strips
function loadImage(idx){
    var img = new Image();
    img.onload = function(){
        var canvas0 = getCanvas(size*2,size*2);
        var ctx0 = canvas0.getContext('2d');
        canvas0.className = 'noprint heximage';
        var slices = [];
        images.push(slices);
        ctx0.save();
        // Rotate to get hex aligned with flat parts on top and bottom
        rotate(ctx0, -Math.PI/6);
        for (var i = 0; i < 3; i++){
            // grab the 6 wedges, 2 at a time
            ctx0.clearRect(0,0,img_height, img_height); 
            // rotate into position to grab two wedges
            rotate(ctx0, -Math.PI/3 * 2);
            ctx0.drawImage(img, 0,0,img.width,img.height,dX,0,img_width,img_height);
            slices.push( wedgeUp(canvas0));
            // if (false){
            if(idx > 2){
                ctx0.save();
                ctx0.clearRect(0,0,img_height,img_height);
                rotate(ctx0, -Math.PI/3*2);
                ctx0.drawImage(img, 0,0,img.width,img.height,dX,0,img_width,img_height);
                slices.push(wedgeDown(canvas0, true));
                ctx0.restore();
            }else{
                slices.push(wedgeDown(canvas0));
            }
        }
        ctx0.restore();
        if ((idx + 1) < img_urls.length){
            loadImage(idx+1);
        }else{
            mapImagesToStrip();
        }
    }
    img.src = img_urls[idx];
}
loadImage(0);



function initWedges(){
    // Requires all wedge images to exist, so all imaages have to be loaded and sliced into the 'images' array
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
        images[3][3],// images[3][0],
        images[4][0],
        images[5][3],// images[5][0],
        images[3][4],// images[3][1],
        images[4][1],
        images[5][4],// images[5][1],
        images[3][5],// images[3][2],
        images[4][2],
        images[5][5],// images[5][2],
        null,
        images[3][0],// images[3][3],
        images[4][3],
        images[5][0],// images[5][3],
        images[3][1],// images[3][4],
        images[4][4],
        images[5][1],// images[5][4],
        images[3][2],// images[3][5],
        images[4][5],
        images[5][2]// images[5][5]
    ];
    return wedges;
}
    

function drawWedge(ctx, x, y, wedge){
    if (wedge){
        ctx.drawImage(wedge, x,y);
    }else{
        //drawTriangle(...);
    }
}

function mapImagesToStrip(){
    var wedges = initWedges();
    ctx1.strokeRect(0,0,x[11],y[3]);
    ctx2.strokeRect(0,0,x[11],y[3]);
    for (var j = 0; j < 10; j++){
        drawWedge(ctx1, x[j], 0, wedges[j]);
        drawWedge(ctx1, x[j], 50+fsize, wedges[j+10]);
        drawWedge(ctx2, x[j], 0, wedges[j+20]);
        drawWedge(ctx2, x[j], 50+fsize, wedges[j+30]);
        drawTriangle(ctx1, x[j], y[j%2], x[j+1], y[(j+1)%2], x[j+2], y[j%2], '#CCC');
        drawTriangle(ctx1, x[j], y[(j+1)%2+2], x[j+1], y[j%2+2], x[j+2], y[(j+1)%2+2], '#CCC');
        drawTriangle(ctx2, x[j], y[(j+1)%2], x[j+1], y[j%2], x[j+2], y[(j+1)%2], '#CCC');
        drawTriangle(ctx2, x[j], y[j%2+2], x[j+1], y[(j+1)%2+2], x[j+2], y[j%2+2], '#CCC');
    }
}
