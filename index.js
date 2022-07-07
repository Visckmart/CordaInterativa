import {ajustaBarra, calculaVento, estimativaInicial, updateCorda, verlet} from "./simulacao.js"
import {drawBolinhasCorda, drawChao, drawCorda, drawObstaculos} from "./visualizacao.js";
import { addV, subV, setMag, dist } from "./Utilities.js";

let canvasElement = document.getElementById("canvas");
let ctx = canvasElement.getContext("2d");

canvasElement.style.backgroundColor = "#EEE";

let width = canvasElement.clientWidth;
let height = canvasElement.clientHeight;

const tamanhoElemento = document.getElementById("tamanho")
const tamanhoValorElemento = document.getElementById("tamanho_valor")

const nPontosElemento = document.getElementById("nPontos")
const nPontosValorElemento = document.getElementById("nPontos_valor")

const ventoAnguloElemento = document.getElementById("vento_angulo")
const ventoAnguloValorElemento = document.getElementById("vento_angulo_valor")

const ventoForcaElemento = document.getElementById("vento_forca")
const ventoForcaValorElemento = document.getElementById("vento_forca_valor")

const groundElemento = document.getElementById("ground")
const groundValorElemento = document.getElementById("ground_valor")

const resetButton = document.getElementById("reset_button")
const debugButton = document.getElementById("debug_button")

let debugMode = false;

debugButton.onclick = () => { debugMode = !debugMode };

let barLen = 1; // Comprimento das barras entre os nós
let tol = 1e-5; // Tolerancia aceita para o comprimento
let tolRel = 120; // Tolerancia relaxamento

let nPontos = 4;

let ventAngulo = 0
let ventForca = 0

let ground = 10;

const altura = 10;
const razao = width / height;
const largura = 10 * razao;
const scaleX = width / largura;
const scaleY = height / altura;

let moveis = [false, true, true, true]; // moveis[i] corresponde ao ponto de indice i e determina se ele é móvel ou imóvel
let currentControlPoints = [[5, 1], [5.5, 1], [7, 1], [8, 1]];
let circulosColisao = [[[5,4],1],[[8,8],0.5]];

function resetParameters() {
    ground = 10;
    barLen = 1; // Comprimento das barras entre os nós
    nPontos = 4;
    updateTamanhoCorda();

    tol = 1e-5; // Tolerancia aceita para o comprimento
    tolRel = 120; // Tolerancia relaxamento

    ventAngulo = 0
    ventForca = 0

    currentControlPoints = [[5, 1], [5.5, 1], [7, 1], [8, 1]];
    refreshControlTexts()
}

resetButton.onclick = resetParameters;
// let ground = 9
ajustaBarra(currentControlPoints, moveis, barLen, tolRel, circulosColisao, ground);
// moveis = [true, true]
// currentControlPoints = [[110, 110],[250,320]]

let mouseDown = false; // Variável para determinar se o mouse está sendo segurado ou não

let cordaAnterior = null;
cordaAnterior = [...currentControlPoints];
currentControlPoints = currentControlPoints.map((ponto) =>
    estimativaInicial(ponto, [0, 0])
);
let lastTime = null;


function getNearControlPoint(controlPoints, point) {
    let nearestControlPoint;
    let nearestDist;
    let nearestIndex;
    for (let index in controlPoints) {
        let currentDist = dist(controlPoints[index], point)
        if (nearestDist === undefined || nearestDist > currentDist) {
            nearestControlPoint = controlPoints[index];
            nearestIndex = index;
            nearestDist = currentDist;
        }
    }
    if (nearestDist < 2.5) {
        // console.log(nearestDist, nearestIndex)
        return parseInt(nearestIndex);
    } else {
        return null;
    }
}
function getNearestObstacle(point, colisionObjects) {
    let nearestObject;
    let nearestDist;
    let nearestIndex;
    for (let index in colisionObjects) {
        let currentDist = dist(colisionObjects[index][0], point)
        if (nearestDist === undefined || nearestDist > currentDist) {
            nearestObject = colisionObjects[index][0];
            nearestIndex = index;
            nearestDist = currentDist;
        }
    }
    // console.log(nearestDist, colisionObjects[nearestIndex][1])
    if (nearestDist < colisionObjects[nearestIndex][1]) {

        return parseInt(nearestIndex);
    } else {
        return null;
    }
}
canvasElement.addEventListener("mousedown", () => {
    mouseDown = true;
    if (nearestControlPointIndex) {
        canvasElement.style.cursor = "grabbing"
    }
});
document.addEventListener("mouseup", () => {
    mouseDown = false;
    // canvasElement.style.cursor = "grab"
    moveis = moveis.map((elem, index) => {
        return true
    })
    movendoCorda = false;
    nearestObstacleIndex = null;
})

let nearestControlPointIndex;
let nearestObstacleIndex;
let movendoCorda = false;
canvasElement.addEventListener("mousemove", (e) => {
    let point = [(e.clientX - canvasElement.getBoundingClientRect().left) / scaleX,
        (e.clientY - canvasElement.getBoundingClientRect().top) / scaleY];
    let newNearestObstacleIndex = getNearestObstacle(point, circulosColisao);
    if (movendoCorda === false) { nearestControlPointIndex = getNearControlPoint(currentControlPoints, point) }
    // console.log(movendoCorda, nearestObstacle)

    if (mouseDown && newNearestObstacleIndex != null) {
        nearestObstacleIndex = newNearestObstacleIndex;
    }
    if (mouseDown && (nearestControlPointIndex != null || nearestObstacleIndex != null)) {
        // console.log(movendoCorda)
        if (nearestObstacleIndex != null && movendoCorda === false) {
            circulosColisao[nearestObstacleIndex][0][0] = point[0];
            circulosColisao[nearestObstacleIndex][0][1] = point[1];
        } else {
            movendoCorda = true;
            currentControlPoints[nearestControlPointIndex][0] = point[0];
            currentControlPoints[nearestControlPointIndex][1] = point[1];
            moveis = moveis.map((elem, index) => {
                return index !== nearestControlPointIndex
            })
        }
        canvasElement.style.cursor = "grabbing"
    } else {
        canvasElement.style.cursor = (nearestControlPointIndex != null || newNearestObstacleIndex != null) ? "grab" : "default";
    }
    if (newNearestObstacleIndex != null) {
        nearestControlPointIndex = null;
    }
})


function updateFrame(time) {
    requestAnimationFrame(updateFrame);
    if (lastTime === null) {
        lastTime = time;
        return;
    }
    const deltaTime = time - lastTime;
    ctx.clearRect(0, 0, width, height);

    const tempCorda = [...currentControlPoints];
    // console.log(cordaAnterior, tolRel)
    let vento = calculaVento(ventForca, ventAngulo);
    currentControlPoints = updateCorda(currentControlPoints, cordaAnterior, moveis, vento, barLen, tol, tolRel, circulosColisao, ground, deltaTime, largura, altura);
    cordaAnterior = tempCorda;
    lastTime = time;

    drawObstaculos(ctx, circulosColisao, scaleX, scaleY);

    drawCorda(ctx, currentControlPoints, deltaTime, scaleX, scaleY);

    // if (debugMode) {
        drawBolinhasCorda(ctx, currentControlPoints, nearestControlPointIndex, scaleX, scaleY);
    // }

    if (ground < 10) {
        drawChao(ctx, ground, width, scaleX, scaleY);
    }
    updateTamanhoCorda();
}

requestAnimationFrame(updateFrame);

function refreshControlTexts() {
    tamanhoValorElemento.textContent = barLen
    nPontosValorElemento.textContent = nPontos.toString()
    ventoAnguloValorElemento.textContent = ventAngulo.toString()
    ventoForcaValorElemento.textContent = ventForca.toString()
    if(ground>10){
        groundValorElemento.textContent = "Sem chão"
    }else{
        groundValorElemento.textContent = (Math.round((10-ground)*10)/10).toString()
    }
}
refreshControlTexts()
groundElemento.addEventListener("input", () => {
    ground = 11-Number.parseFloat(groundElemento.value)
    refreshControlTexts()
})

ventoAnguloElemento.addEventListener("input", () => {
    ventAngulo = Number.parseFloat(ventoAnguloElemento.value)
    refreshControlTexts()
})

ventoForcaElemento.addEventListener("input", () => {
    ventForca = Number.parseFloat(ventoForcaElemento.value)/10
    refreshControlTexts()
})

tamanhoElemento.addEventListener("input", () => {
    barLen = Number.parseFloat(tamanhoElemento.value)
    refreshControlTexts()
})

let lastDir = null
function updateTamanhoCorda() {
    const delta = Math.min(nPontos - currentControlPoints.length, 10);
    let lastPoint =  currentControlPoints[currentControlPoints.length-1]

    let secondToLastPoint = currentControlPoints[currentControlPoints.length - 2]
    let dir = subV(lastPoint, secondToLastPoint);

    // Caso o vetor distância dê 0 uma direção será sorteada
    if (Math.abs(dir[0]) < 1e5 || Math.abs(dir[1]) < 1e5) {
        const x = Math.random() * width
        const y = Math.random() * height
        dir = subV([x,y], lastPoint)
    }
    dir = setMag(dir, barLen);
    let newPos = addV(lastPoint, dir);
    for(let i=0;i<Math.abs(delta);i++) {
        if(delta > 0) {
            currentControlPoints.push(newPos)
            cordaAnterior.push(newPos)
            moveis.push(true)
        } else if(delta < 0) {
            currentControlPoints.pop()
            cordaAnterior.pop()
            moveis.pop()
        }
    }
}
nPontosElemento.addEventListener("input", () => {
    nPontos = Number.parseInt(nPontosElemento.value)
    updateTamanhoCorda()

    refreshControlTexts()
})
refreshControlTexts()