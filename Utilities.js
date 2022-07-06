export function subV(ponto1, ponto2) { // Subtrai uma coordenada de outra
    return [ponto1[0] - ponto2[0], ponto1[1] - ponto2[1]];
}

export function addV(ponto1, ponto2) { // Adiciona uma coordenada à outra
    return [ponto1[0] + ponto2[0], ponto1[1] + ponto2[1]];
}

export function setMag(vetor, mag) { // Normaliza o vetor e o multiplica pela magnitude desejada
    // A normalização é feita pois o vetor recebido é o vetor inteiro entre dois pontos
    let norma2 = Math.sqrt(vetor[0] * vetor[0] + vetor[1] * vetor[1]);
    let vX = vetor[0] / norma2;
    let vY = vetor[1] / norma2;
    return [vX * mag, vY * mag];
}

export function dist(ponto1, ponto2) { // Calcula a distância entre dois pontos
    let a = ponto1[0] - ponto2[0];
    let b = ponto1[1] - ponto2[1];
    return Math.sqrt(a * a + b * b);
}