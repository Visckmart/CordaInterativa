const fpsAverage = 100;
const lastFps = [];
function drawCorda(ctx, controlPoints, deltaT, scaleX, scaleY) {
    const fps = 1 / (deltaT / 1000);
    if (lastFps.length > fpsAverage) {
        lastFps.shift();
    }
    lastFps.push(fps);
    const averageFPS = lastFps.reduce((a, b) => a + b, 0) / lastFps.length;

    ctx.fillStyle = "black";
    ctx.font = "12px monospace";
    ctx.fillText(
        averageFPS.toLocaleString(undefined, {
            maximumFractionDigits: 0,
        }) + " FPS",
        5,
        15,
    );

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let controlPoint of controlPoints) {
        ctx.lineTo(controlPoint[0] * scaleX, controlPoint[1] * scaleY);
    }

    ctx.lineWidth = 3;
    ctx.stroke();
}

export function drawBolinhasCorda(ctx, controlPoints, nearestControlPointIndex, scaleX, scaleY) {

    let i = 0; // Indíce do ponto no próximo for
    for (let controlPoint of controlPoints) {
        ctx.beginPath();
        ctx.arc(
            controlPoint[0] * scaleX,
            controlPoint[1] * scaleY,
            2,
            0,
            2 * Math.PI,
        );
        // console.log(i, nearestControlPoint)
        if (i !== nearestControlPointIndex) { // Se o ponto for móvel, pinte-o de azul
            ctx.fillStyle = "clear";
        } else {
            ctx.fillStyle = "red";
            ctx.fill();
        }
        i += 1;
    }
}

function drawObstaculos(ctx, circulosColisao, scaleX, scaleY) {
    for (let circulo of circulosColisao){
        ctx.beginPath()
        ctx.fillStyle = "#333";
        ctx.arc(circulo[0][0]*scaleX, circulo[0][1]*scaleY, circulo[1]*scaleX, 0, Math.PI*2)
        ctx.fill()
    }
}

function drawChao(ctx, ground, width, scaleX, scaleY) {
    ctx.beginPath()
    ctx.lineTo(0,ground*scaleY)
    ctx.lineTo(width,ground*scaleY)

    ctx.lineWidth = 3;
    ctx.stroke();
}

export { drawCorda, drawObstaculos, drawChao };