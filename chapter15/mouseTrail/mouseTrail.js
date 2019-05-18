window.onload  = () => {

let scheduled;
let trailPoints = [];
let pointTimers = [];
let pointFrames = [];
let numberOfPoints = 45;
let currentIndex = 0;
let mouseX, mouseY;

for (let i = 0; i < numberOfPoints; i++) {
    let point = document.createElement("div");
    point.className = "trail";
    point.style.display = "none";
    document.body.appendChild(point);
    trailPoints.push(point);
}

function updateTrail(event) {
    currentIndex = (currentIndex + 1) % numberOfPoints;
    let currentPoint = trailPoints[currentIndex];
    currentPoint.style.display = "block";
    currentPoint.style.top = `${event.pageY - 3}px`;
    currentPoint.style.left = `${event.pageX - 3}px`;
    let timer;
    if (timer = pointTimers[currentIndex]) {
        clearTimeout(timer);
    }
    pointTimers[currentIndex] = setTimeout(
        function () {
            // pointTimers[currentIndex] = null;
            pointFrames[currentIndex] = window.requestAnimationFrame(() =>
                gravitate(currentPoint, currentIndex));
        }, 2000);
}

function gravitate(point, index) {
    if(scheduled) {
        window.cancelAnimationFrame(pointFrames[index]);
        return;
    }
    let originalY =  point.style.top.slice(0, point.style.top.length - 2);
    let originalX =  point.style.left.slice(0, point.style.left.length - 2);
    let gravity = 2;
    let vector = {x: gravity * Math.sign(mouseX - originalX), y: gravity * Math.sign(mouseY - originalY)};
    point.style.top = `${Number(originalY) + vector.y}px`;
    point.style.left = `${Number(originalX) + vector.x}px`;
    pointFrames[index] = window.requestAnimationFrame(() => gravitate(point));
}
document.body.addEventListener("mousemove", event => {
    if (!scheduled) {
        setTimeout(() => {
            mouseX = event.pageX;
            mouseY = event.pageY;
            updateTrail(event);
            scheduled = null;
        }, 10);
    }
    scheduled = event;
});
};