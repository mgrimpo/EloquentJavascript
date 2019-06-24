"use strict";
let ctx = document.querySelector("canvas").getContext("2d");

class Vector{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(point) {
        return new Vector(
            this.x + point.x,
            this.y + point.y);
    }
    times(factor) {
        return new Vector(this.x * factor, this.y * factor);
    }
}

let center = new Vector(ctx.canvas.width/ 2, ctx.canvas.height /2);
let speed = new Vector(220, 100);
let radius = 10;

let lastTime = null;
function frame(time) {
    if (lastTime != null) {
        updateAnimation(Math.min(100, time - lastTime) / 1000);
    }
    lastTime = time;
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function updateAnimation(step) {
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
    center = moveBall(center,step);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 7);
    ctx.fill();
}


function moveBall(center,  step) {
    let newCenter = center.add(speed.times(step));
    let newCenterXOut = isXOutOfBounds(newCenter), newCenterYOut = isYOutOfBounds(newCenter);
    if (!newCenterXOut && !newCenterYOut) return newCenter;
    if (isXOutOfBounds(newCenter)) {
        speed.x =   - 0.9* speed.x;
    }
    if (isYOutOfBounds(newCenter)) {
        speed.y =   -0.9* speed.y;
    }
    newCenter = center.add(speed.times(step));
    if (isXOutOfBounds(newCenter) || isYOutOfBounds(newCenter)) {
        throw new Error("Ball movement parameters faulty");
    }
    return newCenter;

}


function isYOutOfBounds(circleCenter) {
    let canvas = ctx.canvas;
    let yOutOfBounds = (circleCenter.y + radius > canvas.height )|| 
        (circleCenter.y - radius < 0);
    return yOutOfBounds;
}
function isXOutOfBounds(circleCenter){
    let canvas = ctx.canvas;
    let xOutOfBounds = (circleCenter.x + radius > canvas.width ) || 
        (circleCenter.x - radius < 0);
    return xOutOfBounds;
}

