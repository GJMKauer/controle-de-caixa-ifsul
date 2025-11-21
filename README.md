# Sistema de Controle de Caixa

Aplicação fullstack simples para registrar entradas e saídas de caixa diárias, calcular saldo por dia ou período e visualizar relatórios diretamente na tela. O backend persiste dados em arquivos JSON e o frontend oferece interface com Material UI.

## Stack

- **Frontend:** React + Vite + TypeScript, Material UI, Axios, React Router.
- **Backend:** Node.js (Express) + TypeScript, persistência em `data/*.json`, CORS habilitado.
- **Node recomendado:** v22.17.0 para ambos os apps (`package.json` traz a configuração em `engines`).

## Estrutura

- `backend/` — API Express, scripts de desenvolvimento com Nodemon.
- `frontend/` — Vite + React, tema com MUI.
- `backend/data/` — Persistência em arquivos JSON (`accounts`, `products`, `movements`, `movementsMock`).

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

- Backend: `cd backend && npm run dev` (porta padrão `3001`).
- Frontend: `cd frontend && npm run dev` (porta padrão `5173`).

A API é exposta em `http://localhost:3001/api` e o frontend em `http://localhost:5173`.

### Variáveis úteis

- `USE_MOCK_MOVEMENTS` (backend): por padrão usa movimentações mock enquanto não houver registros reais. Defina como `false` se quiser desativar os mocks desde o início.
- `VITE_API_BASE_URL` (frontend): base da API. Se não definida, assume `http://localhost:3001`.

## Funcionalidades principais

- **Registrar entradas e saídas:** formulário em Movimentações permite escolher tipo (entrada/saída), data, valor, conta contábil e produto opcional. O lançamento atualiza imediatamente os saldos das contas.
- **Dashboard diário:** mostra total de entradas, saídas e saldo do dia atual, além dos saldos por conta.
- **Relatórios por período:** selecione intervalo de datas para ver listagem de movimentações e saldo final do período.
- **Filtros por data:** consultas de movimentações e relatórios aceitam filtros `de/até` (formato `dd/MM/yyyy`), e o intervalo é inclusivo.
- **Mocks e contas contábeis:** produtos e contas iniciais estão em `backend/data/*.json`. Movimentações mockadas ficam em `backend/data/movementsMock.json` e são usadas apenas enquanto não houver movimentações reais (ou até desativar via `USE_MOCK_MOVEMENTS=false`).

## Estrutura de dados

- `accounts.json` — contas contábeis com saldo atual e saldo inicial.
- `movements.json` — movimentos reais persistidos.
- `movementsMock.json` — dados de demonstração.
- `products.json` — catálogo mockado de produtos.
