var r1;
var r2;
var m1;
var m2;
var a1 = Math.PI/2;
var a2 = Math.PI/2;
var a1_v = 0;
var a2_v = 0;
var g = 1;
var x1, y1;
var x2, y2;

var px2 = -1;
var py2 = -1;
var canvas  = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var cx;
var cy;
var offscreenCanvas = document.createElement('canvas');
var context = offscreenCanvas.getContext('2d');

var currentMousePos = { x: -1, y: -1 };

var ifResized = false;
var ifSelecting = true;

var ifMouseDown = false;
var ifInsideOne = false;
var ifInsideTwo = false;

$(document).ready(function(){

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', changeSize, false);
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        init();
        ctx.translate(0,0);
        $('#canvas').mousedown(function(){
            ifMouseDown = true;

        });
        $('#canvas').mousemove(function(){
            if(ifMouseDown == true){
                currentMousePos.x = event.pageX;
                currentMousePos.y = event.pageY;
                if(Math.pow(currentMousePos.x - cx - r1, 2) + Math.pow(currentMousePos.y - cy, 2) <= m1*m1){
                    ifInsideOne = true;
                    ifInsideTwo = false;
                }
                if(ifInsideOne == true && currentMousePos.x >= cx){
                    var dis = calDistance(cx,cy,currentMousePos.x,cy);
                    r1 = dis;
                }
                if(Math.pow(currentMousePos.x - cx - r1 - r2, 2) + Math.pow(currentMousePos.y - cy, 2) <= m2*m2){
                    ifInsideTwo = true;
                    ifInsideOne = false;
                }
                if(ifInsideTwo == true && currentMousePos.x >= cx + r1){
                    var dis = calDistance(cx+r1,cy,currentMousePos.x,cy);
                    r2 = dis;
                }
                // if(Math.pow(currentMousePos.x - cx - r1 - r2, 2) + Math.pow(currentMousePos.y - cy, 2) <= m2*m2){
                //     var dis = calDistance(cx+r1,cy,currentMousePos.x,currentMousePos.y);
                //     if(Math.pow(currentMousePos.x - cx - r1 - dis, 2) + Math.pow(currentMousePos.y - cy, 2) <= m1*m1){
                //         r2 = dis;
                //     }
                // }
            }
        });
        $('#canvas').mouseup(function(){
            ifMouseDown = false;
            ifInsideOne = false;
            ifInsideTwo = false;
        });
        $('#canvas').click(function(){
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
            if(Math.pow(currentMousePos.x - 40, 2) + Math.pow(currentMousePos.y - 40, 2) <= 30*30){
                ifSelecting = false;
            }
        });
    }

    resizeCanvas();
});
    

function init() {
    cx = canvas.width / 2;
    cy = canvas.height / 3;
    r1 = cy / 1.1;
    r2 = cy / 1.1;
    m1 = r2 / 10;
    m2 = r2 / 10;
    offscreenCanvas.setAttribute("width",canvas.width);
    offscreenCanvas.setAttribute("height",canvas.height);
    window.requestAnimationFrame(draw);
}

function draw() {

    if(ifResized == true){
        ifResized = false;
        return;
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(1, 11, 19)";  
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    if(ifSelecting == true){
        drawStart();
    }

    var num1 = -g * (2 * m1 + m2) * Math.sin(a1);
    var num2 = -m2 * g * Math.sin(a1-2*a2);
    var num3 = -2*Math.sin(a1-a2)*m2;
    var num4 = a2_v*a2_v*r2+a1_v*a1_v*r1*Math.cos(a1-a2);
    var den = r1 * (2*m1+m2-m2*Math.cos(2*a1-2*a2));
    var a1_a = (num1 + num2 + num3*num4) / den;
     
    num1 = 2 * Math.sin(a1-a2);
    num2 = (a1_v*a1_v*r1*(m1+m2));
    num3 = g * (m1 + m2) * Math.cos(a1);
    num4 = a2_v*a2_v*r2*m2*Math.cos(a1-a2);
    den = r2 * (2*m1+m2-m2*Math.cos(2*a1-2*a2));
    var a2_a = (num1*(num2+num3+num4)) / den;


    var x1 = r1 * Math.sin(a1);
    var y1 = r1 * Math.cos(a1);

    var x2 = x1 + r2 * Math.sin(a2);
    var y2 = y1 + r2 * Math.cos(a2);


    ctx.beginPath();
    ctx.translate(cx, cy);
    ctx.moveTo(0,0);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(244, 194, 194, 0.5)';
    ctx.stroke();
    ctx.arc(x1, y1, m1/2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(244, 194, 194, 0.5)';
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
    ctx.arc(x2, y2, m2/2, 0, 2 * Math.PI);
    ctx.fill();

    if(ifSelecting == true){
        a1_a = 0;
        a2_a = 0;
    }

    a1_v += a1_a;
    a2_v += a2_a;
    a1 += a1_v;
    a2 += a2_v;


    if (px2 != -1 && py2 != -1 && ifSelecting == false){

        context.save();
        // var gradient = context.createLinearGradient(0, 0, canvas.width/3, canvas.height/3);
        // var gradient = ctx.createRadialGradient(cx, 0, canvas.width / 10, cx, cy * 2, canvas.width / 2);
        var gradient = ctx.createRadialGradient(cx, cy, r1, cx, cy, r1+r2+canvas.height/10);
        gradient.addColorStop(0, 'rgb(135, 211, 248)');
        gradient.addColorStop(1, 'rgb(255, 255, 255)');

        context.beginPath();
        context.translate(cx, cy);
        context.moveTo(px2, py2);
        context.lineTo(x2, y2);
        context.lineWidth = 2;

    
        context.strokeStyle = gradient;

        context.translate(-cx, -cy);
        context.stroke();
        context.closePath();
        context.restore();
}
    px2 = x2;
    py2 = y2;
    ctx.restore();
    ctx.drawImage(offscreenCanvas, 0, 0);


    window.requestAnimationFrame(draw);

} 

function changeSize() {
    ifResized = true;
}

function calDistance(x1,y1,x2,y2) {

    var a = x1 - x2;
    var b = y1 - y2;

    var c = Math.sqrt( a*a + b*b );
    return c;


}

function drawStart() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(40, 40, 30, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(244, 194, 194, 0.5)';
    ctx.fill();
    ctx.translate(22,20);
    ctx.moveTo(10, 10);
    ctx.lineTo(30,20);
    ctx.lineTo(10,30);
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.restore();
}
