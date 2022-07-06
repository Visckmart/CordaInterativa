import { addV, subV, setMag, dist } from "./Utilities.js";

function forca(tempo,vento) {
    return [0+vento[0], massa * 9.8+vento[1]]
}

 
const passoIntegracao = 1

export function estimativaInicial([x0, y0], [vx0, vy0]) {
    return [x0 + passoIntegracao * vx0, y0 + passoIntegracao * vy0]
}

const massa = 0.1
const fatorRelaxamento = 0.02
export function verlet([x, y], [xAnterior, yAnterior], tempo, vento) {
    const [fx, fy] = forca(tempo,vento)

    let xProx = x + (1 - fatorRelaxamento) * (x - xAnterior) + ((tempo ** 2) / massa) * fx
    let yProx = y + (1 - fatorRelaxamento) * (y - yAnterior) + ((tempo ** 2) / massa) * fy

    return [xProx, yProx]
}

export function calculaVento(ventForca, ventAngulo){
    let angle = ventAngulo*(Math.PI/180)
    return [ventForca*Math.cos(angle),ventForca*Math.sin(angle)]
}

export function updateCorda(currentControlPoints, previousControlPoints, freePoints, vento, barLen, tol, tolRel, circulosColisao, ground, deltaTime) {
    let newControlPoints = currentControlPoints.map((ponto, index) => {
        if (freePoints[index]) {
            return verlet(ponto, previousControlPoints[index], (deltaTime) / 1000, vento);
        } else {
            return ponto;
        }
    });
    // console.log(newControlPoints);
    ajustaBarra(newControlPoints, freePoints, barLen, tol, tolRel, circulosColisao, ground); // Ajusta as barras

    return newControlPoints;
}

function ajustaBarra(listaPontos, listaMoveis, barLen, tol, tolRel, circulosColisao, ground) {
    let n = 0;
    while (relaxaBarra(listaPontos, listaMoveis, barLen, tol, circulosColisao, ground)) {
        n += 1;
        if (n > tolRel) {
            return n;
        }
    }
    return n;
}

function colisao(posicao, circulosColisao, ground) {
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

function relaxaBarra(listaPontos, listaMoveis, barLen, tol, circulosColisao, ground) { // Faz o ajuste das barras
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
        newPos = colisao(newPos, circulosColisao, ground)
        newPos2 = colisao(newPos2, circulosColisao, ground)
        if (listaMoveis[i]) { // (Apenas se estes forem móveis)
            listaPontos[i] = newPos;
        }
        if (listaMoveis[i + 1]) {
            listaPontos[i + 1] = newPos2;
        }
    }
    return flag;
}
export { ajustaBarra, colisao };