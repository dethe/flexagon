var video = document.querySelector('video');
navigator.getMedia = ( navigator.getUserMedia ||
               navigator.webkitGetUserMedia ||
               navigator.mozGetUserMedia ||
               navigator.msGetUserMedia);

function startCamera(){
    var videoStream = navigator.getMedia({video:true}, function(stream) {
        if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
        } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
        console.log('video ready');
    },function(err){
        console.log('an error occurred: %o', err);
    });
}
var capturing = false;
var captureTarget = null;
var drawFrame = null;
document.addEventListener('click', function(event){
    if (!event.target.classList.contains('heximage')){
        console.log(event.target);
        return;
    }
    if (capturing){
        console.log('we are already capturing video on another image');
        return;
    }
    capturing = true;
    captureTarget = event.target;
    var idx = parseInt(captureTarget.dataset.index, 10);
    // var ctx = hexcontexts[idx];
    video.height = video.videoHeight;
    video.width = video.videoHeight / factor;
    drawFrame = function(){
        // console.log('drawing frame');
        sliceAndDice(captureTarget, video, idx);
        mapImagesToStrip();
    }
});
document.addEventListener('keypress', function(event){
    if (capturing){
        capturing = false;
        captureTarget = null;
        drawFrame = null;
    }
});
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
          window.requestAnimationFrame = requestAnimationFrame;
})();
function eachFrame(){
    if (drawFrame){
        drawFrame();
    }
    requestAnimationFrame(eachFrame);
}
// startCamera();
requestAnimationFrame(eachFrame);
