const express = require('express');
const _ = require('lodash');
const { adicao, subtracao, multiplicacao, divisao, router: rotasOperacoes } = require('./operacoes');

// Execuções solicitadas para o console
console.log('--- Resultados das Operações ---');
console.log('8 + 4 =', adicao(8, 4));
console.log('15 - 7 =', subtracao(15, 7));
console.log('6 * 3 =', multiplicacao(6, 3));
console.log('20 / 5 =', divisao(20, 5));
console.log('10 / 0 =', divisao(10, 0));

// Uso do Lodash para número aleatório entre 1 e 30
console.log('Número aleatório (Lodash 1 a 30):', _.random(1, 30));

// Servidor Express para disponibilizar as rotas
const app = express();
app.use(express.json());
app.use('/', rotasOperacoes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nServidor rodando em http://localhost:${PORT}`);
});