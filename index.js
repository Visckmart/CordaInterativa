import { estimativaInicial, verlet } from "./simulacao.js"

let canvasElement = document.getElementById("canvas");
let ctx = canvasElement.getContext("2d");

let width = canvasElement.clientWidth;
let height = canvasElement.clientHeight;

canvasElement.style.backgroundColor = "#EEE";

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
const resetButton = document.getElementById("resetButton")

let barLen = 1; // Comprimento das barras entre os nós
let tol = 1e-5; // Tolerancia aceita para o comprimento
let tolRel = 120; // Tolerancia relaxamento

let nPontos = 4;

let ventAngulo = 0
let ventForca = 0
let vento = [0,0]

let ground = 11;

function resetParameters() {
    ground = 11;
    barLen = 1; // Comprimento das barras entre os nós
    tol = 1e-5; // Tolerancia aceita para o comprimento
    tolRel = 120; // Tolerancia relaxamento

    ventAngulo = 0
    ventForca = 0
    vento = [0,0]
    refreshControlTexts()
}
resetButton.onclick = resetParameters

const altura = 10;
const razao = width / height;
const largura = 10 * razao;
const scaleX = width / largura;
const scaleY = height / altura;

let moveis = [false, true, true, true]; // moveis[i] corresponde ao ponto de indice i e determina se ele é móvel ou imóvel
let currentControlPoints = [[5, 1], [5.5, 1], [7, 1], [8, 1]];
let circulosColisao = [[[5,4],1],[[8,8],0.5]]
// let ground = 9

ajustaBarra(currentControlPoints, moveis);
// moveis = [true, true]
// currentControlPoints = [[110, 110],[250,320]]

let mouseDown = false; // Variável para determinar se o mouse está sendo segurado ou não

function subV(ponto1, ponto2) { // Subtrai uma coordenada de outra
    return [ponto1[0] - ponto2[0], ponto1[1] - ponto2[1]];
}
function addV(ponto1, ponto2) { // Adiciona uma coordenada à outra
    return [ponto1[0] + ponto2[0], ponto1[1] + ponto2[1]];
}
function setMag(vetor, mag) { // Normaliza o vetor e o multiplica pela magnitude desejada
                              // A normalização é feita pois o vetor recebido é o vetor inteiro entre dois pontos
    let norma2 = Math.sqrt(vetor[0] * vetor[0] + vetor[1] * vetor[1]);
    let vX = vetor[0] / norma2;
    let vY = vetor[1] / norma2;
    return [vX * mag, vY * mag];
}

function dist(ponto1, ponto2) { // Calcula a distância entre dois pontos
    let a = ponto1[0] - ponto2[0];
    let b = ponto1[1] - ponto2[1];
    return Math.sqrt(a * a + b * b);
}

function ajustaBarra(listaPontos, listaMoveis) {
    let n = 0;
    while (relaxaBarra(listaPontos, listaMoveis)) {
        n += 1;
        if (n > tolRel) {
            return n;
        }
    }
    return n;
}

function colisao(posicao) {
    for(let i = 0; i < circulosColisao.length; i++){
        let dir = subV(circulosColisao[i][0],posicao);
        let distancia = dist(posicao, circulosColisao[i][0]); // Calcule a distancia entre eles;
        if(distancia<circulosColisao[i][1]){
            let magnitude = Math.abs(distancia - circulosColisao[i][1]);
            dir = setMag(dir,magnitude)
            posicao = subV(posicao,dir)
        }
    }
    if(ground<=10){
        if(posicao[1]>ground){
            posicao[1] = ground
        }
    }
    return posicao

}

function relaxaBarra(listaPontos, listaMoveis) { // Faz o ajuste das barras
                                                 // listaPontos é a lista de todos os pontos da barra
                                                 // listaBarras é a lista correspondente que indica quais dos pontos são móveis
    let flag = false;
    for (let i = 0; i < listaPontos.length - 1; i++) {
        // Para cada ponto (e o ponto seguinte na lista)...
        let dir = subV(listaPontos[i + 1], listaPontos[i]); // Calcule a direção (o vetor entre os dois pontos);
        let distancia = dist(listaPontos[i], listaPontos[i + 1]); // Calcule a distancia entre eles;
        let magnitude = Math.abs(distancia - barLen);
        if (listaMoveis[i] && listaMoveis[i + 1]) {
            magnitude = magnitude / 2;
        }
        magnitude = Math.abs(distancia - barLen) / 2; // Calcule e determine a magnitude baseado na distancia entre os dois pontos
        dir = setMag(dir, magnitude);
        if (Math.abs(barLen - distancia) < tol) { // Se estivermos dentro da tolerância desejada, zere o vetor;
            dir = [0, 0];
        } else {
            flag = true;
            if (distancia < barLen) { // Se a barra estiver menor que o desejado, inverta a direção do movimento.
                dir = [-dir[0], -dir[1]];
            }
        }
        let newPos = addV(listaPontos[i], dir); // Move o ponto atual em direção ao próximo ponto
        let newPos2 = subV(listaPontos[i + 1], dir); // Move o próximo ponto em direção ao ponto atual
        newPos = colisao(newPos)
        newPos2 = colisao(newPos2)
        if (listaMoveis[i]) { // (Apenas se estes forem móveis)
            listaPontos[i] = newPos;
        }
        if (listaMoveis[i + 1]) {
            listaPontos[i + 1] = newPos2;
        }
    }
    return flag;
}

const fpsAverage = 100;
const lastFps = [];
function drawCorda(controlPoints, deltaT) {
    const fps = 1 / (deltaT / 1000);
    if (lastFps.length > fpsAverage) {
        lastFps.shift();
    }
    lastFps.push(fps);
    const averageFPS = lastFps.reduce((a, b) => a + b, 0) / lastFps.length;

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(
        averageFPS.toLocaleString(undefined, {
            maximumFractionDigits: 2,
        }),
        5,
        12,
    );

    ctx.beginPath();
    ctx.lineJoin = "round";

    for (let controlPoint of controlPoints) {
        ctx.lineTo(controlPoint[0] * scaleX, controlPoint[1] * scaleY);
    }

    ctx.lineWidth = 3;
    ctx.stroke();

    let i = 0; // Indíce do ponto no próximo for
    for (let controlPoint of controlPoints) {
        ctx.beginPath();
        ctx.arc(
            controlPoint[0] * scaleX,
            controlPoint[1] * scaleY,
            3,
            0,
            2 * Math.PI,
        );
        // console.log(i, nearestControlPoint)
        if (i != nearestControlPointIndex) { // Se o ponto for móvel, pinte-o de azul
            ctx.fillStyle = "blue";
        } else {
            ctx.fillStyle = "red";
        }
        ctx.fill();
        i += 1;
    }

    for (let circulo of circulosColisao){
        ctx.beginPath()
        ctx.fillStyle = "black";
        ctx.arc(circulo[0][0]*scaleX, circulo[0][1]*scaleY, circulo[1]*scaleX, 0, Math.PI*2)
        ctx.fill()
    }

    ctx.beginPath()
    ctx.lineTo(0,ground*scaleY)
    ctx.lineTo(width,ground*scaleY)

    ctx.lineWidth = 3;
    ctx.stroke();
}

let cordaAnterior = null;
cordaAnterior = [...currentControlPoints];
currentControlPoints = currentControlPoints.map((ponto) =>
    estimativaInicial(ponto, [0, 0])
);
let lastTime = null;

function calculaVento(){
    let angle = ventAngulo*(Math.PI/180)
    return [ventForca*Math.cos(angle),ventForca*Math.sin(angle)]
}

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
    if (nearestDist < 50) {
        // console.log(nearestDist, nearestIndex)
        return parseInt(nearestIndex);
    }
}
canvasElement.addEventListener("mousedown", () => {
    mouseDown = true;
    canvasElement.style.cursor = "grabbing"
});
canvasElement.addEventListener("mouseup", () => {
    mouseDown = false;
    canvasElement.style.cursor = "grab"
    moveis = moveis.map((elem, index) => {
        return true
    })
})

let nearestControlPointIndex;
canvasElement.addEventListener("mousemove", (e) => {
    nearestControlPointIndex = getNearControlPoint(currentControlPoints, 
        [(e.clientX - canvasElement.getBoundingClientRect().left) / scaleX, 
        (e.clientY - canvasElement.getBoundingClientRect().top) / scaleY])
    if (mouseDown) {
        currentControlPoints[nearestControlPointIndex][0] = (e.clientX - canvasElement.getBoundingClientRect().left) / scaleX;
        currentControlPoints[nearestControlPointIndex][1] = (e.clientY - canvasElement.getBoundingClientRect().top) / scaleY;
        moveis = moveis.map((elem, index) => {
            return index !== nearestControlPointIndex
        })
        canvasElement.style.cursor = "grabbing"
    } else {
        canvasElement.style.cursor = "grab"
    }
})
// document.body.cursor = "none"

function updateFrame(time) {
    requestAnimationFrame(updateFrame);
    if (lastTime === null) {
        lastTime = time;
        return;
    }
    const deltaT = time - lastTime;
    ctx.clearRect(0, 0, width, height);

    vento = calculaVento()

    const tempCorda = [...currentControlPoints];
    currentControlPoints = currentControlPoints.map((ponto, index) => {
        if (moveis[index]) {
            return verlet(ponto, cordaAnterior[index], (deltaT) / 1000, vento);
        } else {
            return ponto;
        }
    });

    ajustaBarra(currentControlPoints, moveis); // Ajusta as barras

    lastTime = time;
    cordaAnterior = tempCorda;

    drawCorda(currentControlPoints, deltaT);
}

requestAnimationFrame(updateFrame);

let controles = [tamanhoElemento, nPontosElemento, ventoAnguloElemento, ventoForcaElemento, groundElemento]
let textosControles = {
    tamanhoValorElemento,
    nPontosValorElemento,
    ventoAnguloValorElemento,
    ventoForcaValorElemento,
    groundValorElemento
}

function refreshControlTexts() {
    tamanhoValorElemento.textContent = barLen
    nPontosValorElemento.textContent = nPontos.toString()
    ventoAnguloValorElemento.textContent = ventAngulo.toString()
    ventoForcaValorElemento.textContent = ventForca.toString()
    if(ground>10){
        groundValorElemento.textContent = "Sem chão"
    }else{
        groundValorElemento.textContent = ground.toString()
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

nPontosElemento.addEventListener("input", () => {
    nPontos = Number.parseInt(nPontosElemento.value)
    
    const delta = nPontos - currentControlPoints.length
    let lastPoint =  currentControlPoints[currentControlPoints.length-1]
    //console.log(lastPoint)
    let secondToLastPoint = currentControlPoints[currentControlPoints.length - 2]
    let dir = subV(lastPoint, secondToLastPoint);
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
    refreshControlTexts()
})
refreshControlTexts()