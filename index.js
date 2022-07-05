import { estimativaInicial, verlet } from "./simulacao.js";

let canvasElement = document.getElementById("canvas");
let ctx = canvasElement.getContext("2d");

let width = canvasElement.clientWidth;
let height = canvasElement.clientHeight;

canvasElement.style.backgroundColor = "#EEE";

let barLen = 1; // Comprimento das barras entre os nós
let tol = 1e-5; // Tolerancia aceita para o comprimento

let moveis = [false, true, true, true]; // moveis[i] corresponde ao ponto de indice i e determina se ele é móvel ou imóvel

const altura = 10;
const razao = width / height;
const largura = 10 * razao;
const scaleX = width / largura;
const scaleY = height / altura;
let currentControlPoints = [[5, 5], [5.5, 5], [7, 5], [8, 5]];
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
    if (n > 50) {
      return n;
    }
  }
  return n;
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
    if (moveis[i]) { // Se o ponto for móvel, pinte-o de azul
      ctx.fillStyle = "blue";
    } else {
      ctx.fillStyle = "red";
    }
    ctx.fill();
    i += 1;
  }
}

let cordaAnterior = null;
cordaAnterior = [...currentControlPoints];
currentControlPoints = currentControlPoints.map((ponto) =>
  estimativaInicial(ponto, [0, 0])
);
let lastTime = null;

/*
Supostamente as proximas linhas deveriam fazer com que enquanto o mouse estiver sendo apertado,
o primeiro ponto se moveria para o mouse. Mas por algum motivo o onmouseup não parece funcionar
então depois de apertar o mouse uma única vez o ponto seguirá ele para sempre.

Além disso o código só roda enquanto o mouse está em movimento, portanto se o primeiro ponto da lista
estiver setado como "móvel" fica bem tosco, recomendo deixar imóvel enquanto essa parte do código estiver aqui
  */
document.addEventListener("mousedown");
onmousedown = function () {
  mouseDown = true;
};
onmouseup = function () {
  mouseDown = false;
};
if (mouseDown) {
  onmousemove = function (e) {
    currentControlPoints[0][0] = e.clientX / scaleX;
    currentControlPoints[0][1] = e.clientY / scaleY;
  };
}

function updateFrame(time) {
  requestAnimationFrame(updateFrame);
  if (lastTime === null) {
    lastTime = time;
    return;
  }
  const deltaT = time - lastTime;
  ctx.clearRect(0, 0, width, height);

  const tempCorda = [...currentControlPoints];
  currentControlPoints = currentControlPoints.map((ponto, index) => {
    if (moveis[index]) {
      return verlet(ponto, cordaAnterior[index], (deltaT) / 1000);
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
