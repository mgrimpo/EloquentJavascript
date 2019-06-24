let canvas = document.querySelector("canvas");
canvas.height = 4000;
canvas.width = 4000;
let cx = canvas.getContext("2d");
let padding = 10;

function drawTrapezoid() {
    let shorter = 30;
    let width = 200;
    let height = 100;
    cx.beginPath();
    cx.moveTo(shorter + padding, 0 + padding);
    cx.lineTo(width - shorter + padding, 0 + padding);
    cx.lineTo(width + padding, height + padding);
    cx.lineTo(0 + padding, height + padding);
    cx.closePath();
    cx.stroke();
}

function drawDiamond() {
    cx.save();
    cx.fillStyle = "red";
    let height = 200;
    let width = 200;
    cx.translate(cx.canvas.width /2, (cx.canvas.height - height) / 3);
    cx.rotate(0.25 * Math.PI);
    cx.fillRect(0, 0, 200, 200);
    cx.restore();
}

function drawZigZag(){
    cx.save();
    cx.translate(13,10);
    let length = 350;
    let descent = 30;
    cx.beginPath();
    cx.moveTo(padding, padding);
    let numDescents = (cx.canvas.height - 2 * padding)/ (descent);
    for (let i = 1; i < numDescents; i+=2) {
        cx.lineTo(length + padding, padding + i * descent);
        cx.lineTo(padding, padding + (i+1) * descent);
    }
    cx.stroke();
    cx.restore();
}

function drawSpiral(){
    let steps = 30000;
    let radius = 2000;
    let xRadius = 2000;
    let yRadius = 2000;
    let spiralDistance = 10;
    let currentAngle = -0.5 *  2 * Math.PI;
    cx.save();
    // cx.translate(200,200);
    cx.strokeStyle ="001f3f";
    cx.moveTo(Math.cos(currentAngle) * xRadius + radius, Math.sin(currentAngle) * yRadius + radius);
    cx.beginPath();
    for (let i=0; i< steps; i++) {
        currentAngle += 2 * Math.PI / (steps/ radius *10);
        xRadius -= radius/ steps;
        yRadius -=  radius / steps;
        cx.lineTo(Math.cos(currentAngle) * xRadius + radius, Math.sin(currentAngle) * yRadius + radius);
    } 
    cx.stroke();
    cx.restore();
}

function pointOnCircle(angle, radius, adjust=1) {
    if (1 < adjust  || adjust< 0) throw new Error("illegal value for paramter 'adjust'");
    return {
        x: Math.cos(angle) * radius + radius * adjust,
        y: Math.sin(angle) * radius + radius * adjust 
    };
}
function drawStar(numSpikes,radius, color ="#0074D9"){
    cx.save();
    let angle = -0.5 * Math.PI *2;
    let point = pointOnCircle(angle, radius);
    cx.translate(canvas.width/2 -radius, canvas.height/2 -radius);
    cx.beginPath();
    cx.moveTo(point.x, point.y);
    cx.fillStyle = color;
    for (let i= 0; i < numSpikes ; i++) {
       angle += (2 * Math.PI) / numSpikes; 
       point = pointOnCircle(angle, radius);
       cx.quadraticCurveTo(radius, radius, point.x, point.y);
    }
    cx.closePath();
    cx.fill();
    cx.restore();
}

export default pointOnCircle;