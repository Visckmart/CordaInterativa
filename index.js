let canvasElement = document.getElementById("canvas")
let ctx = canvasElement.getContext("2d")

let width = canvasElement.clientWidth
let height = canvasElement.clientHeight

canvasElement.style.backgroundColor = "#EEE"

let currentControlPoints = [[10, 10], [50, 20], [80, 45]]

function drawCorda(controlPoints) {
    ctx.beginPath()

    for (let controlPoint of controlPoints) {
        ctx.lineTo(controlPoint[0], controlPoint[1])
    }

    ctx.lineWidth = 3
    ctx.stroke()

    for (let controlPoint of controlPoints) {
        ctx.beginPath()
        ctx.arc(controlPoint[0], controlPoint[1], 3, 0, 2*Math.PI)
        ctx.fill()
    }
}

function updateFrame() {
    ctx.clearRect(0, 0, width, height)

    currentControlPoints[1][1] += 0.05
    currentControlPoints[2][1] += 0.1

    drawCorda(currentControlPoints)

    requestAnimationFrame(updateFrame)
}

requestAnimationFrame(updateFrame)
