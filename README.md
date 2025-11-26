# Sistema de Controle de Caixa

Aplicação fullstack para controlar entradas/saídas de caixa, acompanhar saldos por conta e visualizar balanço patrimonial com depreciação. Toda a persistência é feita em arquivos JSON no backend.

## Stack

- **Frontend:** React + Vite + TypeScript, Material UI, Axios, React Router.
- **Backend:** Node.js (Express) + TypeScript, persistência em `backend/data/*.json`, CORS habilitado.
- **Node recomendado:** v22.17.0 (definido em `engines` de ambos os apps).

## Estrutura do projeto

- `backend/` — API Express (TS), scripts com Nodemon.
- `frontend/` — Vite + React (TS) com tema MUI.
- `backend/data/` — Persistência em arquivos JSON:
  - `accounts.json` — contas contábeis (saldo inicial/atual).
  - `movements.json` — movimentações consolidadas.
  - `products.json` — catálogo de produtos vinculado a contas.
  - `assets.json` — bens patrimoniais para cálculo de depreciação.

## Instalação

1. **Backend**
   ```bash
   cd backend
   npm install
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   ```

## Execução em desenvolvimento

- Backend: `cd backend && npm run dev` (porta padrão `3001`).
- Frontend: `cd frontend && npm run dev` (porta padrão `5173`).
- A API é exposta em `http://localhost:3001/api` e o frontend em `http://localhost:5173`.

### Variáveis úteis

- `VITE_API_BASE_URL` (frontend): base da API. Se não definida, usa `http://localhost:3001`.

## Funcionalidades

- **Movimentações:** registre entradas ou saídas com descrição, valor, data, conta e produto opcional. As movimentações atualizam saldos das contas imediatamente.
- **Transferências entre contas contábeis:** quando informado `fromAccount`/`toAccount`, a movimentação movimenta o razonete dos dois lados (útil para compras que saem do caixa/banco e entram em um ativo).
- **Dashboard diário:** mostra total de entradas, saídas e saldo do dia corrente, além dos saldos por conta.
- **Relatórios por período:** filtragem por data com resumo de entradas/saídas e listagem de movimentações.
- **Balanço patrimonial com depreciação:** exibe ativos/passivos, detalha razonetes por conta (débitos/créditos), permite registrar novos ativos com data de aquisição e calcula depreciação linear pelas taxas fiscais padrão (ex.: móveis/utensílios 10% a.a., informática 20% a.a.). O saldo final (SF) aparece na coluna principal e o valor líquido já considera a depreciação.

## Dados iniciais

- **Contas:** editáveis em `backend/data/accounts.json` (ativos, fornecedores, empréstimos, patrimônio líquido etc.).
- **Movimentações:** carregadas diretamente de `backend/data/movements.json`.
- **Produtos:** catálogo em `backend/data/products.json`.
- **Bens:** cadastrados em `backend/data/assets.json` para cálculo de depreciação.

## Endpoints principais (backend)

- `GET /api/movements?from&to` — lista movimentações com filtros de data (`dd/MM/yyyy`).
- `POST /api/movements` — cria movimentação (campos principais: `description`, `account`, `type`, `amount`, `date`; opcionais: `productId`, `fromAccount`, `toAccount`).
- `GET /api/summary/daily?date` — resumo diário.
- `GET /api/summary/period?from&to` — resumo do período.
- `GET /api/accounts` — lista contas com saldos.
- `GET /api/products` — lista produtos.
- `POST /api/assets` — cria bem patrimonial.
- `GET /api/balance?from&to` — balanço patrimonial com depreciação.

## Notas de uso e ajustes

- As taxas de depreciação são lidas das próprias contas (`depreciationRateAnnual`).
- Para mudar portas ou base de API, ajuste `VITE_API_BASE_URL` no frontend ou o script de inicialização do backend.
