function forca(tempo) {
    return [0, massa * 9.8]
}

 
const passoIntegracao = 1

export function estimativaInicial([x0, y0], [vx0, vy0]) {
    return [x0 + passoIntegracao * vx0, y0 + passoIntegracao * vy0]
}

const massa = 0.1
const fatorRelaxamento = 0.02
export function verlet([x, y], [xAnterior, yAnterior], tempo) {
    const [fx, fy] = forca(tempo)

    let xProx = x + (1 - fatorRelaxamento) * (x - xAnterior) + ((tempo ** 2) / massa) * fx
    let yProx = y + (1 - fatorRelaxamento) * (y - yAnterior) + ((tempo ** 2) / massa) * fy

    return [xProx, yProx]
}