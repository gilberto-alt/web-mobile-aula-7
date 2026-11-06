# Controle financeiro pessoal · Web Mobile Aula 7

API REST em NestJS e MongoDB para registrar receitas e despesas e acompanhar os gastos por impulso. A ideia é apoiar atividades de educação financeira e consumo consciente, relacionadas aos ODS 1 e 12.

## Como rodar

1. Use Node.js 22 ou superior e rode `npm ci`.
2. Copie `.env.example` para `.env`. No MongoDB Atlas, configure um usuário de banco e autorize seu IP. Copie a string de conexão do driver, indique o banco `controle_financeiro` na URI e coloque o valor em `MONGODB_URI` no seu `.env`. Se houver caracteres reservados na senha, codifique-os para uso na URI.
3. Rode `npm run start:dev` e acesse `http://localhost:3000/transacoes`.

O valor da transação deve ser um número positivo, com até duas casas decimais e limite de 999.999.999,99. Use ponto como separador decimal no JSON. O tipo aceita `receita` ou `despesa`. Envie `consumoConsciente` como booleano nos dois tipos. O campo só entra no cálculo de gastos por impulso para despesas.

## Endpoints

`POST /transacoes` grava a transação e retorna HTTP 201 com os dados e o identificador do MongoDB. Dados inválidos recebem HTTP 400.

```bash
curl -X POST http://localhost:3000/transacoes \
  -H 'Content-Type: application/json' \
  -d '{"descricao":"Conta de luz","valor":250.50,"tipo":"despesa","categoria":"Moradia","consumoConsciente":true}'
```

`GET /transacoes` retorna o histórico e as métricas `saldoTotal`, `totalDespesas` e `totalGastoImpulso`. O Service calcula o saldo subtraindo as despesas das receitas e soma como impulso as despesas marcadas com `consumoConsciente: false`.

```bash
curl http://localhost:3000/transacoes
```

## Testes

`npm run build` compila a aplicação. Para testar as rotas por HTTP com persistência real, use um servidor MongoDB local ou descartável.

```bash
MONGODB_TEST_URI=mongodb://127.0.0.1:27017 npm test
```

A suíte cria um banco temporário com nome aleatório para a execução e o remove no final. O usuário de teste precisa ter permissão para criar e excluir esse banco.
