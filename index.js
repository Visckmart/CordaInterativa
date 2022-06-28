let canvasElement = document.getElementById("canvas")
let ctx = canvasElement.getContext("2d")

let width = canvasElement.clientWidth
let height = canvasElement.clientHeight

canvasElement.style.backgroundColor = "#EEE"

let barLen = 100    // Comprimento das barras entre os nós
let fator = 10     // Velocidade do processo de relaxamento
let tol = 0.1     // Tolerancia aceita para o comprimento

let moveis = [false, true,  true, true]  // moveis[i] corresponde ao ponto de indice i e determina se ele é móvel ou imóvel
let currentControlPoints = [[110, 110], [150, 120], [180, 145],[150,220]]
// moveis = [true, true]
// currentControlPoints = [[110, 110],[250,320]]



let mouseDown = false // Variável para determinar se o mouse está sendo segurado ou não

function subV(ponto1,ponto2){ // Subtrai uma coordenada de outra
    return [ponto1[0]-ponto2[0],ponto1[1]-ponto2[1]]
}
function addV(ponto1,ponto2){ // Adiciona uma coordenada à outra
    return [ponto1[0]+ponto2[0],ponto1[1]+ponto2[1]]
}
function setMag(vetor,mag){   // Normaliza o vetor e o multiplica pela magnitude desejada
    // A normalização é feita pois o vetor recebido é o vetor inteiro entre dois pontos
    let norma2 = Math.sqrt(vetor[0]*vetor[0]+vetor[1]*vetor[1])
    let vX = vetor[0]/norma2
    let vY = vetor[1]/norma2
    return [vX*mag,vY*mag]
}

function dist(ponto1,ponto2){ // Calcula a distância entre dois pontos
    let a = ponto1[0] - ponto2[0];
    let b = ponto1[1] - ponto2[1];
    return Math.sqrt( a*a + b*b );
}

function ajustaBarra(listaPontos,listaMoveis){ // Faz o ajuste das barras
    // listaPontos é a lista de todos os pontos da barra
    // listaBarras é a lista correspondente que indica quais dos pontos são móveis
    for (let i = 0;i<listaPontos.length-1;i++){
        // Para cada ponto (e o ponto seguinte na lista)...
        let dir = subV(listaPontos[i+1], listaPontos[i])        // Calcule a direção (o vetor entre os dois pontos);
        let distancia = dist(listaPontos[i], listaPontos[i+1])  // Calcule a distancia entre eles;
        let magnitude = fator*Math.abs(distancia-barLen)/100    // Calcule e determine a magnitude com uma fórmula (atualmente arbitrária) entre
        dir = setMag(dir,magnitude)                             // o fator escolhido e o quão distante do comprimento desejado a barra está;
        if(Math.abs(barLen-distancia)<tol){                     // Se estivermos dentro da tolerância desejada, zere o vetor;
            dir = [0,0]                                         
        }else if(distancia<barLen){                             // Se a barra estiver menor que o desejado, inverta a direção do movimento.
            dir = [-dir[0],-dir[1]]
        }
        let newPos = addV(listaPontos[i],dir)     // Move o ponto atual em direção ao próximo ponto               
        let newPos2 = subV(listaPontos[i+1],dir)  // Move o próximo ponto em direção ao ponto atual
        if(listaMoveis[i]){                       // (Apenas se estes forem móveis)
            listaPontos[i] = newPos
        }
        if(listaMoveis[i+1]){
            listaPontos[i+1] = newPos2
        }
    }
}


function drawCorda(controlPoints) {
    ctx.beginPath()

    for (let controlPoint of controlPoints) {
        ctx.lineTo(controlPoint[0], controlPoint[1])
    }

    ctx.lineWidth = 3
    ctx.stroke()

    let i = 0 // Indíce do ponto no próximo for
    for (let controlPoint of controlPoints) {
        ctx.beginPath()
        ctx.arc(controlPoint[0], controlPoint[1], 3, 0, 2*Math.PI)
        if(moveis[i]){ // Se o ponto for móvel, pinte-o de azul
            ctx.fillStyle = "blue";
        }else{
            ctx.fillStyle = "red";
        }
        ctx.fill()
        i += 1
    }
}

function updateFrame() {
    ctx.clearRect(0, 0, width, height)


    ajustaBarra(currentControlPoints,moveis) // Ajusta as barras

    /* 
    Supostamente as proximas linhas deveriam fazer com que enquanto o mouse estiver sendo apertado,
    o primeiro ponto se moveria para o mouse. Mas por algum motivo o onmouseup não parece funcionar
    então depois de apertar o mouse uma única vez o ponto seguirá ele para sempre.
    
    Além disso o código só roda enquanto o mouse está em movimento, portanto se o primeiro ponto da lista
    estiver setado como "móvel" fica bem tosco, recomendo deixar imóvel enquanto essa parte do código estiver aqui
    */
    onmousedown = function() { 
        mouseDown = true
    }
    onmouseup = function() {
        mouseDown = false
    }
    if(mouseDown){
        onmousemove = function(e){
            currentControlPoints[0][0] = e.clientX
            currentControlPoints[0][1] = e.clientY
        }
        
    }

    drawCorda(currentControlPoints)
    requestAnimationFrame(updateFrame)
}



requestAnimationFrame(updateFrame)
