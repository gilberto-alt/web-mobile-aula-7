const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { after, before, beforeEach, test } = require('node:test');
const { NestFactory } = require('@nestjs/core');
const { getConnectionToken } = require('@nestjs/mongoose');
const { AppModule } = require('../dist/app.module');

const receita = {
  descricao: 'Salário',
  valor: 5000,
  tipo: 'receita',
  categoria: 'Trabalho',
  consumoConsciente: false,
};

let app;
let banco;
let url;

before(async () => {
  const uri = process.env.MONGODB_TEST_URI;
  assert.ok(uri, 'Defina MONGODB_TEST_URI para rodar os testes de integração.');

  // Cada execução usa um banco próprio para não misturar os dados dos testes.
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB_NAME = 'aula7_test_' + randomUUID().replaceAll('-', '');
  app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  banco = app.get(getConnectionToken());
  await app.listen(0, '127.0.0.1');
  url = (await app.getUrl()) + '/transacoes';
});

beforeEach(async () => {
  await banco.collection('transacoes').deleteMany({});
});

after(async () => {
  try {
    await banco?.dropDatabase();
  } finally {
    await app?.close();
  }
});

function cadastrar(dados) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}

test('GET retorna o histórico vazio e as métricas zeradas', async () => {
  const resposta = await fetch(url);

  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), {
    historico: [],
    metricas: { saldoTotal: 0, totalDespesas: 0, totalGastoImpulso: 0 },
  });
});

test('POST cadastra uma receita e devolve a transação gravada', async () => {
  const resposta = await cadastrar({ ...receita, descricao: '  Salário  ' });

  assert.equal(resposta.status, 201);
  const { _id, ...dados } = await resposta.json();
  assert.match(_id, /^[a-f0-9]{24}$/);
  assert.deepEqual(dados, receita);
});

test('GET lista as transações e soma apenas as despesas por impulso', async () => {
  const luz = {
    descricao: 'Conta de luz',
    valor: 250,
    tipo: 'despesa',
    categoria: 'Moradia',
    consumoConsciente: true,
  };
  const compra = {
    descricao: 'Compra por impulso',
    valor: 400,
    tipo: 'despesa',
    categoria: 'Lazer',
    consumoConsciente: false,
  };
  for (const dados of [receita, luz, compra]) {
    const resposta = await cadastrar(dados);
    assert.equal(resposta.status, 201);
    await resposta.json();
  }

  const resposta = await fetch(url);
  assert.equal(resposta.status, 200);
  const { historico, metricas } = await resposta.json();

  assert.deepEqual(historico.map(({ _id, ...dados }) => dados), [receita, luz, compra]);
  assert.deepEqual(metricas, {
    saldoTotal: 4350,
    totalDespesas: 650,
    totalGastoImpulso: 400,
  });
});

test('GET calcula centavos e aceita saldo negativo', async () => {
  for (const valor of [0.1, 0.2]) {
    const resposta = await cadastrar({ ...receita, valor, tipo: 'despesa' });
    assert.equal(resposta.status, 201);
    await resposta.json();
  }

  const resposta = await fetch(url);
  assert.equal(resposta.status, 200);
  const { metricas } = await resposta.json();

  assert.deepEqual(metricas, {
    saldoTotal: -0.3,
    totalDespesas: 0.3,
    totalGastoImpulso: 0.3,
  });
});

test('POST rejeita dados inválidos sem gravá-los no histórico', async () => {
  const casosInvalidos = [
    {},
    [],
    { ...receita, descricao: '   ' },
    { ...receita, categoria: null },
    { ...receita, tipo: 'transferencia' },
    { ...receita, valor: -10 },
    { ...receita, valor: 0 },
    { ...receita, valor: '5000' },
    { ...receita, valor: 1.001 },
    { ...receita, consumoConsciente: 'false' },
    { ...receita, consumoConsciente: undefined },
    { ...receita, campoExtra: true },
  ];
  for (const dados of casosInvalidos) {
    const resposta = await cadastrar(dados);
    assert.equal(resposta.status, 400, JSON.stringify(dados));
    await resposta.json();
  }

  const resposta = await fetch(url);
  assert.equal(resposta.status, 200);
  assert.deepEqual((await resposta.json()).historico, []);
});
