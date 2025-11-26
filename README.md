# Sistema de Controle de Caixa

Aplicação fullstack para registrar entradas/saídas de caixa, acompanhar saldos por conta e visualizar balanço patrimonial com depreciação. Toda a persistência é feita em arquivos JSON no backend.

## Stack
- **Frontend:** React + Vite + TypeScript, Material UI, Axios, React Router.
- **Backend:** Node.js (Express) + TypeScript, persistência em `backend/data/*.json`, CORS habilitado.
- **Node recomendado:** v22.17.0 (definido em `engines` de ambos os apps).

## Estrutura do projeto
- `backend/` — API Express (TS), scripts com Nodemon.
- `frontend/` — Vite + React (TS) com tema MUI.
- `backend/data/` — Persistência em arquivos JSON:
  - `accounts.json` — contas contábeis com saldo inicial.
  - `movements.json` — movimentações consolidadas.
  - `products.json` — catálogo de produtos vinculado a contas.
  - `assets.json` — bens existentes para cálculo de depreciação (sem cadastro manual).

> Não há cadastro manual de bens/ativos; a depreciação usa apenas os bens do arquivo e a taxa anual definida em cada conta.

## Instalação
1. Backend
   ```bash
   cd backend
   npm install
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   ```

## Execução em desenvolvimento
- Backend: `cd backend && npm run dev` (porta `3001`).
- Frontend: `cd frontend && npm run dev` (porta `5173`).
- API em `http://localhost:3001/api` | Frontend em `http://localhost:5173`.

### Variáveis úteis
- `VITE_API_BASE_URL` (frontend): base da API. Se não definida, usa `http://localhost:3001`.

## Funcionalidades
- **Movimentações:** registre entradas/saídas com descrição, valor, data e conta; suporta `fromAccount`/`toAccount` para transferências contábeis (reflete nos razonetes dos dois lados).
- **Dashboard diário:** total de entradas, saídas e saldo do dia, mais saldos por conta recalculados pelas movimentações.
- **Relatórios por período:** filtro por data, resumo de entradas/saídas e listagem em ordem cronológica decrescente.
- **Balanço patrimonial com depreciação:** mostra ativos/passivos e razonetes por conta (débitos/créditos), utiliza saldos acumulados até a data de referência e aplica depreciação linear conforme taxa anual da conta; o valor líquido já considera depreciação.

## Dados iniciais
- Contas: `backend/data/accounts.json`.
- Movimentações: `backend/data/movements.json` (sem mocks).
- Produtos: `backend/data/products.json`.

## Endpoints principais
- `GET /api/movements?from&to` — lista movimentações (`dd/MM/yyyy`), ordenadas do mais novo para o mais antigo.
- `POST /api/movements` — cria movimentação (`description`, `account`, `type`, `amount`, `date`; opcionais: `fromAccount`, `toAccount`, `productId`).
- `GET /api/summary/daily?date` — resumo diário.
- `GET /api/summary/period?from&to` — resumo do período.
- `GET /api/accounts` — contas com saldos atualizados pelas movimentações.
- `GET /api/products` — lista produtos.
- `GET /api/balance?from&to` — balanço patrimonial com depreciação.

## Notas
- Saldos atuais são recalculados a partir do saldo inicial + movimentações (incluindo transferências e espelho clientes/fornecedores).
- As taxas de depreciação são definidas na própria conta (`depreciationRateAnnual`).
- Ajuste portas/base da API via `VITE_API_BASE_URL` ou scripts do backend conforme necessário.

## Scripts úteis
- Backend: `npm run dev` (nodemon), `npm run build`, `npm start`.
- Frontend: `npm run dev`, `npm run build`, `npm run preview`.
