import { randomUUID } from "crypto";
import { Account } from "../models/Account";
import { Movement, MovementType } from "../models/Movement";
import { Product } from "../models/Product";
import {
  appendMovement,
  fetchAccounts,
  fetchMockMovements,
  fetchMovements,
  fetchProducts,
  saveAccounts,
} from "../repositories/cashRepository";

interface MovementInput {
  account: string;
  amount: number;
  date: number | string;
  description: string;
  productId?: string;
  type: MovementType;
}

interface Summary {
  balance: number;
  totalIncome: number;
  totalOutcome: number;
}

interface SummaryWithMovements extends Summary {
  movements: Movement[];
}

const DAY_IN_MS = 86_400_000;

/** Converte um valor de data para timestamp.
 * @param value - Data em string (ex.: YYYY-MM-DD ou ISO) ou timestamp.
 * @returns Timestamp correspondente à data.
 */
const parseDateToTimestamp = (value: string | number): number => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = new Date(value).getTime();

  if (Number.isNaN(parsed)) {
    throw new Error("Data inválida");
  }

  return parsed;
};

/** Calcula o timestamp inicial de um dia (00:00:00.000).
 * @param value - Representação de data.
 * @returns Timestamp do início do dia.
 */
const getDayStart = (value: string): number => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  return date.getTime();
};

/** Calcula o timestamp final de um dia (23:59:59.999).
 * @param value - Representação de data.
 * @returns Timestamp do fim do dia.
 */
const getDayEnd = (value: string): number => getDayStart(value) + DAY_IN_MS - 1;

/** Filtra movimentações por intervalo de datas (inclusivo).
 * @param movements - Movimentações base.
 * @param from - Data inicial (YYYY-MM-DD) opcional.
 * @param to - Data final (YYYY-MM-DD) opcional.
 * @returns Movimentações filtradas.
 */
const filterByDateRange = (
  movements: Movement[],
  from?: string,
  to?: string
): Movement[] => {
  const start = from ? getDayStart(from) : null;
  const end = to ? getDayEnd(to) : null;

  return movements.filter((movement) => {
    if (start !== null && movement.date < start) {
      return false;
    }

    if (end !== null && movement.date > end) {
      return false;
    }

    return true;
  });
};

/** Constrói um objeto de resumo para uma lista de movimentações.
 * @param movements - Movimentações alvo.
 * @returns Totais de entrada, saída e saldo.
 */
const buildSummary = (movements: Movement[]): Summary => {
  const totals = movements.reduce(
    (acc, movement) => {
      if (movement.type === "INCOME") {
        acc.totalIncome += movement.amount;
      } else {
        acc.totalOutcome += movement.amount;
      }

      return acc;
    },
    { balance: 0, totalIncome: 0, totalOutcome: 0 } as Summary
  );

  return {
    ...totals,
    balance: totals.totalIncome - totals.totalOutcome,
  };
};

/** Recupera as movimentações com filtros opcionais de período.
 * @param from - Data inicial no formato YYYY-MM-DD.
 * @param to - Data final no formato YYYY-MM-DD.
 * @returns Lista filtrada de movimentações.
 */
const listMovements = async (
  from?: string,
  to?: string
): Promise<Movement[]> => {
  const movements = await fetchMovements();

  return filterByDateRange(movements, from, to).sort(
    (first, second) => second.date - first.date
  );
};

/** Recupera apenas os mock de movimentações.
 * @returns Lista mockada.
 */
const listMockMovements = async (): Promise<Movement[]> => fetchMockMovements();

/** Atualiza o saldo de uma conta com base em uma movimentação.
 * @param accounts - Lista de contas atual.
 * @param movement - Movimentação a aplicar.
 * @returns Lista de contas com saldo atualizado.
 */
const applyMovementToAccounts = (
  accounts: Account[],
  movement: Movement
): Account[] => {
  const targetIndex = accounts.findIndex(
    (account) => account.id === movement.account
  );

  if (targetIndex === -1) {
    throw new Error("Conta informada não existe");
  }

  const updated = [...accounts];
  const target = { ...updated[targetIndex] };

  const delta = movement.type === "INCOME" ? movement.amount : -movement.amount;
  target.currentBalance += delta;
  updated[targetIndex] = target;

  return updated;
};

/** Cria uma movimentação, persiste e retorna a versão final.
 * @param payload - Dados de entrada do usuário.
 * @returns Movimentação criada.
 */
const createMovement = async (payload: MovementInput): Promise<Movement> => {
  if (!payload.description || !payload.account) {
    throw new Error("Descrição e conta são obrigatórias");
  }

  if (payload.type !== "INCOME" && payload.type !== "OUTCOME") {
    throw new Error("Tipo de movimentação inválido");
  }

  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor da movimentação inválido");
  }

  const date = parseDateToTimestamp(payload.date);
  const movement: Movement = {
    ...payload,
    amount,
    date,
    id: randomUUID(),
  };

  const accounts = await fetchAccounts();
  const updatedAccounts = applyMovementToAccounts(accounts, movement);
  await saveAccounts(updatedAccounts);
  await appendMovement(movement);

  return movement;
};

/** Gera resumo diário para uma data específica.
 * @param date - Data alvo em YYYY-MM-DD.
 * @returns Resumo consolidado do dia.
 */
const getDailySummary = async (date: string): Promise<SummaryWithMovements> => {
  const movements = await listMovements(date, date);
  const summary = buildSummary(movements);

  return { ...summary, movements };
};

/** Gera resumo para um período.
 * @param from - Data inicial.
 * @param to - Data final.
 * @returns Resumo consolidado do intervalo.
 */
const getPeriodSummary = async (
  from?: string,
  to?: string
): Promise<SummaryWithMovements> => {
  const movements = await listMovements(from, to);
  const summary = buildSummary(movements);

  return { ...summary, movements };
};

/** Recupera as contas com saldos atualizados.
 * @returns Lista de contas.
 */
const getAccounts = async (): Promise<Account[]> => fetchAccounts();

/** Lista os produtos mockados.
 * @returns Lista de produtos disponíveis.
 */
const getProducts = async (): Promise<Product[]> => fetchProducts();

export {
  applyMovementToAccounts,
  buildSummary,
  createMovement,
  getAccounts,
  getDailySummary,
  getPeriodSummary,
  getProducts,
  listMockMovements,
  listMovements,
};
