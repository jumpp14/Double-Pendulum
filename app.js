const g = 1;

var xPivot;
var yPivot;
var nearPendulumMass;
var farPendulumMass;
var nearRodLength;
var farRodLength;
var nearPendulumAngle = Math.PI/2;
var farPendulumAngle = Math.PI/2;
var nearPendulumAngularVelocity = 0;
var farPendulumAngularVelocity = 0;
var x1, y1;
var x2, y2;
var previous_x2 = -1;
var previous_y2 = -1;

var canvas  = document.getElementById('canvas');
var context = canvas.getContext('2d');
var offscreenCanvas = document.createElement('canvas');
var offscreenContext = offscreenCanvas.getContext('2d');

var currentMousePosition = { x: -1, y: -1 };

var isCanvasResized = false;
var isChangingLengths = true;
var isMouseDown = false;
var isInsideNearPendulum = false;
var isInsideFarPendulum = false;

function init() {
    xPivot = canvas.width / 2;
    yPivot = canvas.height / 3;
    nearPendulumMass = 18;
    farPendulumMass = 18;
    nearRodLength = yPivot / 1.1;
    farRodLength = yPivot / 1.1;
    
    offscreenCanvas.setAttribute("width", canvas.width);
    offscreenCanvas.setAttribute("height", canvas.height);

    window.requestAnimationFrame(draw);
}

function changeSize() {
    isCanvasResized = true;
}

function drawStartIcon() {
    context.save();
    context.beginPath();
    context.arc(40, 40, 30, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(244, 194, 194, 0.5)';
    context.fill();
    context.translate(22,20);
    context.moveTo(10, 10);
    context.lineTo(30,20);
    context.lineTo(10,30);
    context.closePath();
    context.strokeStyle = "black";
    context.stroke();
    context.restore();
}

function drawPendulums(x1, x2, y1, y2){
    context.beginPath();
    context.translate(xPivot, yPivot);
    context.moveTo(0,0);
    context.lineTo(x1, y1);
    context.closePath();
    context.strokeStyle = 'rgba(244, 194, 194, 0.5)';
    context.stroke();
    context.arc(x1, y1, nearPendulumMass/2, 0, 2 * Math.PI);
    context.fillStyle = 'rgba(244, 194, 194, 0.5)';
    context.fill();
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();
    context.arc(x2, y2, farPendulumMass/2, 0, 2 * Math.PI);
    context.fill();
}

function drawPendulumTrajectory(x2, y2, previous_x2, previous_y2, xPivot, yPivot){
    if(previous_x2 != -1 && previous_y2 != -1 && isChangingLengths === false){
        offscreenContext.save();

        var gradient = context.createRadialGradient(xPivot, yPivot, nearRodLength, xPivot, yPivot, nearRodLength + farRodLength + canvas.height / 10);
        gradient.addColorStop(0, 'rgb(135, 211, 248)');
        gradient.addColorStop(1, 'rgb(255, 255, 255)');

        offscreenContext.beginPath();
        offscreenContext.translate(xPivot, yPivot);
        offscreenContext.moveTo(previous_x2, previous_y2);
        offscreenContext.lineTo(x2, y2);
        offscreenContext.lineWidth = 2;
        offscreenContext.strokeStyle = gradient;
        offscreenContext.translate(-xPivot, -yPivot);
        offscreenContext.stroke();
        offscreenContext.closePath();
        offscreenContext.restore();
    }
}

function draw() {
    if(isCanvasResized === true){
        isCanvasResized = false;
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgb(1, 11, 19)";  
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();

    if(isChangingLengths == true){
        drawStartIcon();
    }

    var nearPendulumAngularAcceleration = calculateNearPendulumAngularAcceleration();
    var farPendulumAngularAcceleration = calculateFarPendulumAngularAcceleration();
    if(isChangingLengths === true){
        nearPendulumAngularAcceleration = 0;
        farPendulumAngularAcceleration = 0;
    }

    nearPendulumAngularVelocity += nearPendulumAngularAcceleration;
    farPendulumAngularVelocity += farPendulumAngularAcceleration;
    nearPendulumAngle += nearPendulumAngularVelocity;
    farPendulumAngle += farPendulumAngularVelocity;

    var x1 = nearRodLength * Math.sin(nearPendulumAngle);
    var y1 = nearRodLength * Math.cos(nearPendulumAngle);
    var x2 = x1 + farRodLength * Math.sin(farPendulumAngle);
    var y2 = y1 + farRodLength * Math.cos(farPendulumAngle);

    drawPendulums(x1, x2, y1, y2);
    drawPendulumTrajectory(x2, y2, previous_x2, previous_y2, xPivot, yPivot);

    previous_x2 = x2;
    previous_y2 = y2;
    context.restore();
    context.drawImage(offscreenCanvas, 0, 0);

    window.requestAnimationFrame(draw);
} 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offscreenContext.clearRect(0, 0, canvas.width, canvas.height);
    init();
    context.translate(0,0);
    $('#canvas').mousedown(function(){
        isMouseDown = true;
    });
    $('#canvas').mousemove(function(){
        if(isMouseDown == true){
            currentMousePosition.x = event.pageX;
            currentMousePosition.y = event.pageY;
            if(Math.pow(currentMousePosition.x - xPivot - nearRodLength, 2) + Math.pow(currentMousePosition.y - yPivot, 2) <= nearPendulumMass * nearPendulumMass){
                isInsideNearPendulum = true;
                isInsideFarPendulum = false;
            }
            if(isInsideNearPendulum == true && currentMousePosition.x >= xPivot){
                var dis = calculateDistance(xPivot,yPivot,currentMousePosition.x,yPivot);
                nearRodLength = dis;
            }
            if(Math.pow(currentMousePosition.x - xPivot - nearRodLength - farRodLength, 2) + Math.pow(currentMousePosition.y - yPivot, 2) <= farPendulumMass * farPendulumMass){
                isInsideFarPendulum = true;
                isInsideNearPendulum = false;
            }
            if(isInsideFarPendulum == true && currentMousePosition.x >= xPivot + nearRodLength){
                var dis = calculateDistance(xPivot+nearRodLength,yPivot,currentMousePosition.x,yPivot);
                farRodLength = dis;
            }
        }
    });
    $('#canvas').mouseup(function(){
        isMouseDown = false;
        isInsideNearPendulum = false;
        isInsideFarPendulum = false;
    });
    $('#canvas').click(function(){
        currentMousePosition.x = event.pageX;
        currentMousePosition.y = event.pageY;
        if(Math.pow(currentMousePosition.x - 40, 2) + Math.pow(currentMousePosition.y - 40, 2) <= 30*30){
            isChangingLengths = false;
        }
    });
}

function calculateDistance(x1,y1,x2,y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a * a + b * b );
    return c;
}

function calculateNearPendulumAngularAcceleration(){
    var numerator1 = -g * (2 * nearPendulumMass + farPendulumMass) * Math.sin(nearPendulumAngle);
    var numerator2 = -farPendulumMass * g * Math.sin(nearPendulumAngle - 2 * farPendulumAngle);
    var numerator3 = -2 * Math.sin(nearPendulumAngle - farPendulumAngle) * farPendulumMass;
    var numerator4 = farPendulumAngularVelocity * farPendulumAngularVelocity * farRodLength + nearPendulumAngularVelocity * nearPendulumAngularVelocity * nearRodLength * Math.cos(nearPendulumAngle - farPendulumAngle);
    var denominator = nearRodLength * (2 * nearPendulumMass + farPendulumMass - farPendulumMass * Math.cos(2 * nearPendulumAngle - 2 * farPendulumAngle));
    return (numerator1 + numerator2 + numerator3 * numerator4) / denominator;
}

function calculateFarPendulumAngularAcceleration(){
    var numerator1 = 2 * Math.sin(nearPendulumAngle - farPendulumAngle);
    var numerator2 = (nearPendulumAngularVelocity * nearPendulumAngularVelocity * nearRodLength * (nearPendulumMass + farPendulumMass));
    var numerator3 = g * (nearPendulumMass + farPendulumMass) * Math.cos(nearPendulumAngle);
    var numerator4 = farPendulumAngularVelocity * farPendulumAngularVelocity * farRodLength * farPendulumMass * Math.cos(nearPendulumAngle - farPendulumAngle);
    var denominator = farRodLength * (2 * nearPendulumMass + farPendulumMass - farPendulumMass * Math.cos(2 * nearPendulumAngle - 2 * farPendulumAngle));
    return (numerator1 * (numerator2 + numerator3 + numerator4)) / denominator;
}

$(document).ready(function(){
    window.addEventListener('resize', changeSize, false);
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
});