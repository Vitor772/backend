"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomizarCaminho = void 0;
function randomizarCaminho(chance) {
    const chanceA = chance; // 20% de chance para o caminho A
    const max = 1;
    const min = 0;
    const numeroAleatorio = Math.random() * (max - min) + min; // Gere um número aleatório entre 0 e 1
    if (numeroAleatorio < chanceA) {
        return "A";
    }
    else {
        return "B";
    }
}
exports.randomizarCaminho = randomizarCaminho;
