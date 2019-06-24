import pointOnCircle from './shapes.js';

let cx = document.querySelector("canvas").getContext("2d");
let total = results
    .reduce((sum, { count }) => sum + count, 0);
let currentAngle = -0.5 * Math.PI;
let centerX = 300, centerY = 150;
let radius = 100;

// Add code to draw the slice labels in this loop.
for (let result of results) {
    let sliceAngle = (result.count / total) * 2 * Math.PI;
    cx.beginPath();
    cx.arc(centerX, centerY, radius,
        currentAngle, currentAngle + sliceAngle);
    currentAngle += sliceAngle;
    cx.lineTo(centerX, centerY);
    cx.fillStyle = result.color;
    cx.fill();

    // Add label to slice
    let labelAngle = currentAngle - 0.5 * sliceAngle;
    let point = pointOnCircle(labelAngle, radius + 40, 0);
    // Adjust point for label length and position
    point.x += centerX;
    point.y += centerY;
    if (point.x < centerX) point.x -= 32 *result.name.length * (1* (centerX-point.x)/ centerX);
    if (point.y < centerY) point.y += 16;
    cx.font = "18px Georgia";
    cx.fillStyle = result.color;
    let percentage = result.count  * 100 / total ;
    cx.fillText(`${result.name}, ${percentage.toFixed(2)}%`,point.x,point.y);
}