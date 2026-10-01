const express = require('express');
const router = express.Router();

// Funções de cálculo solicitadas
function adicao(a, b) {
  return a + b;
}

function subtracao(a, b) {
  return a - b;
}

function multiplicacao(a, b) {
  return a * b;
}

function divisao(a, b) {
  if (b === 0) {
    return 'Erro: divisão por zero!';
  }
  return a / b;
}

// Rotas GET
router.get('/adicao', (req, res) => {
  res.send('Você esta na rota adição');
});

router.get('/subtracao', (req, res) => {
  res.send('Você esta na rota subtração');
});

router.get('/multiplicacao', (req, res) => {
  res.send('Você esta na rota multiplicação');
});

router.get('/divisao', (req, res) => {
  res.send('Você esta na rota divisão');
});

// Rotas POST (recebendo { a, b } no corpo da requisição)
router.post('/adicao', (req, res) => {
  const { a, b } = req.body;
  res.json({ resultado: adicao(Number(a), Number(b)) });
});

router.post('/subtracao', (req, res) => {
  const { a, b } = req.body;
  res.json({ resultado: subtracao(Number(a), Number(b)) });
});

router.post('/multiplicacao', (req, res) => {
  const { a, b } = req.body;
  res.json({ resultado: multiplicacao(Number(a), Number(b)) });
});

router.post('/divisao', (req, res) => {
  const { a, b } = req.body;
  const resultado = divisao(Number(a), Number(b));
  res.json({ resultado });
});

// Exportação das funções e do roteador
module.exports = {
  adicao,
  subtracao,
  multiplicacao,
  divisao,
  router
};