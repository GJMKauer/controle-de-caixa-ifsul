import { randomUUID } from "crypto";
import { Account } from "../models/Account";
import { Asset } from "../models/Asset";
import { Movement, MovementType } from "../models/Movement";
import { Product } from "../models/Product";
import { fetchAssets } from "../repositories/assetRepository";
import { appendMovement, fetchAccounts, fetchMovements, fetchProducts, saveAccounts } from "../repositories/cashRepository";

interface MovementInput {
  account: string;
  amount: number;
  date: number | string;
  description: string;
  fromAccount?: string;
  toAccount?: string;
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

interface AssetBalanceLine {
  accountId: string;
  accountName: string;
  depreciation: number;
  netValue: number;
  rate: number;
  totalCost: number;
}

interface BalanceSheet {
  assets: AssetBalanceLine[];
  date: number;
  equity: number;
  liabilities: AssetBalanceLine[];
  totals: {
    assets: number;
    liabilities: number;
  };
}

/** Normaliza uma string de data em partes (dia, mês, ano).
 * @param value - Data em string no formato dd/MM/yyyy ou yyyy-MM-dd.
 * @returns Objeto com partes numéricas da data.
 */
const parseDateParts = (
  value: string
): { day: number; month: number; year: number } => {
  const normalized = value.trim();
  const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashMatch) {
    const [, day, month, year] = slashMatch;

    return { day: Number(day), month: Number(month), year: Number(year) };
  }

  const dashMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dashMatch) {
    const [, year, month, day] = dashMatch;

    return { day: Number(day), month: Number(month), year: Number(year) };
  }

  const fallbackDate = new Date(normalized);

  if (Number.isNaN(fallbackDate.getTime())) {
    throw new Error("Data inválida");
  }

  return {
    day: fallbackDate.getUTCDate(),
    month: fallbackDate.getUTCMonth() + 1,
    year: fallbackDate.getUTCFullYear(),
  };
};

/** Converte partes de data em timestamp UTC.
 * @param parts - Partes de dia, mês e ano.
 * @param endOfDay - Indica se deve considerar o fim do dia.
 * @returns Timestamp calculado.
 */
const toUtcTimestamp = (
  parts: { day: number; month: number; year: number },
  endOfDay = false
): number =>
  Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

/** Converte um valor de data para timestamp.
 * @param value - Data em string ou timestamp.
 * @param mode - Se é início ou final do dia.
 * @returns Timestamp correspondente à data.
 */
const parseDateToTimestamp = (
  value: string | number,
  mode: "start" | "end" = "start"
): number => {
  if (typeof value === "number") {
    return value;
  }

  const parts = parseDateParts(value);

  return toUtcTimestamp(parts, mode === "end");
};

/** Calcula o timestamp inicial de um dia (00:00:00.000 UTC).
 * @param value - Representação de data.
 * @returns Timestamp do início do dia.
 */
const getDayStart = (value: string): number =>
  parseDateToTimestamp(value, "start");

/** Calcula o timestamp final de um dia (23:59:59.999 UTC).
 * @param value - Representação de data.
 * @returns Timestamp do fim do dia.
 */
const getDayEnd = (value: string): number => parseDateToTimestamp(value, "end");

/** Calcula depreciação linear de um bem com base na taxa anual.
 * @param asset - Ativo avaliado.
 * @param annualRate - Taxa anual em percentual.
 * @param referenceDate - Data de referência para cálculo.
 * @returns Valor depreciação acumulada.
 */
const calculateDepreciation = (
  asset: Asset,
  annualRate: number,
  referenceDate: number
): number => {
  if (!annualRate || annualRate <= 0) {
    return 0;
  }

  const elapsedMs = Math.max(0, referenceDate - asset.acquisitionDate);
  const years = elapsedMs / (365 * 24 * 60 * 60 * 1000);
  const depreciation = (asset.cost * annualRate * years) / 100;

  return Math.min(depreciation, asset.cost);
};

/** Filtra movimentações por intervalo de datas, inclusive.
 * @param movements - Movimentações base.
 * @param from - Data inicial (dd/MM/yyyy) opcional.
 * @param to - Data final (dd/MM/yyyy) opcional.
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
    (accumulator, movement) => {
      if (movement.type === "INCOME") {
        accumulator.totalIncome += movement.amount;
      } else {
        accumulator.totalOutcome += movement.amount;
      }

      return accumulator;
    },
    { balance: 0, totalIncome: 0, totalOutcome: 0 } as Summary
  );

  return {
    ...totals,
    balance: totals.totalIncome - totals.totalOutcome,
  };
};

/** Recupera as movimentações com filtros opcionais de período.
 * @param from - Data inicial no formato dd/MM/yyyy.
 * @param to - Data final no formato dd/MM/yyyy.
 * @returns Lista filtrada de movimentações.
 */
const listMovements = async (
  from?: string,
  to?: string
): Promise<Movement[]> => {
  const movements = await fetchMovements();

  return filterByDateRange(movements, from, to)
    .map((movement, index) => ({ movement, index }))
    .sort((first, second) => {
      if (second.movement.date !== first.movement.date) {
        return second.movement.date - first.movement.date;
      }

      return second.index - first.index;
    })
    .map((item) => item.movement);
};

/** Retorna o lado (débito/crédito) apropriado para um delta em uma conta.
 * @param category - Categoria da conta.
 * @param delta - Tipo de variação (aumento/diminuição).
 * @returns Lado da variação.
 */
const getSideForDelta = (
  category: Account["category"],
  delta: "INCREASE" | "DECREASE"
): "DEBIT" | "CREDIT" => {
  const isAsset = category === "ASSET";
  const isIncrease = delta === "INCREASE";

  if (isAsset) {
    return isIncrease ? "DEBIT" : "CREDIT";
  }

  return isIncrease ? "CREDIT" : "DEBIT";
};

/** Retorna o lado (débito/crédito) apropriado para uma movimentação em uma conta.
 * @param category - Categoria da conta.
 * @param type - Tipo da movimentação.
 * @returns Lado da movimentação.
 */
const getSideForMovement = (
  category: Account["category"],
  type: Movement["type"]
): "DEBIT" | "CREDIT" => {
  if (category === "ASSET") {
    return type === "INCOME" ? "DEBIT" : "CREDIT";
  }

  return type === "INCOME" ? "CREDIT" : "DEBIT";
};

/** Retorna o lado apropriado (débito/crédito) para um delta de transferência. */
const getTransferDelta = (
  category: Account["category"],
  role: "FROM" | "TO"
): { direction: "INCREASE" | "DECREASE"; side: "DEBIT" | "CREDIT" } => {
  const isAsset = category === "ASSET";
  const isLiabilityOrEquity = category === "LIABILITY" || category === "EQUITY";

  const direction: "INCREASE" | "DECREASE" =
    role === "FROM"
      ? isAsset
        ? "DECREASE"
        : "INCREASE"
      : isAsset
      ? "INCREASE"
      : isLiabilityOrEquity
      ? "DECREASE"
      : "INCREASE";

  return {
    direction,
    side: getSideForDelta(category, direction),
  };
};

/** Recalcula os saldos atuais das contas a partir das movimentações. */
const computeCurrentBalances = (
  accounts: Account[],
  movements: Movement[]
): Account[] => {
  const accountById = accounts.reduce<Record<string, Account>>(
    (accumulator, account) => {
      accumulator[account.id] = account;
      return accumulator;
    },
    {}
  );
  const runningBalance = accounts.reduce<Record<string, number>>(
    (accumulator, account) => {
      accumulator[account.id] = account.initialBalance;
      return accumulator;
    },
    {}
  );

  const applyBalanceDelta = (
    accountId: string,
    side: "DEBIT" | "CREDIT",
    amount: number
  ): void => {
    const account = accountById[accountId];
    if (!account) {
      return;
    }
    const isAsset = account.category === "ASSET";
    const factor = isAsset ? 1 : -1;
    runningBalance[accountId] += (side === "DEBIT" ? amount : -amount) * factor;
  };

  const sorted = [...movements].sort(
    (first, second) => first.date - second.date
  );

  sorted.forEach((movement) => {
    if (movement.fromAccount && movement.toAccount) {
      const from = accountById[movement.fromAccount];
      const to = accountById[movement.toAccount];
      if (!from || !to) {
        return;
      }

      const fromSide = getTransferDelta(from.category, "FROM").side;
      const toSide = getTransferDelta(to.category, "TO").side;
      applyBalanceDelta(movement.fromAccount, fromSide, movement.amount);
      applyBalanceDelta(movement.toAccount, toSide, movement.amount);
      return;
    }

    const account = accountById[movement.account];
    if (!account) {
      return;
    }
    const side = getSideForMovement(account.category, movement.type);
    applyBalanceDelta(movement.account, side, movement.amount);

    const counterId = movement.type === "INCOME" ? "clientes" : "fornecedores";
    const counterAccount = accountById[counterId];
    if (counterAccount && counterId !== movement.account) {
      const counterSide: "DEBIT" | "CREDIT" =
        side === "DEBIT" ? "CREDIT" : "DEBIT";
      applyBalanceDelta(counterId, counterSide, movement.amount);
    }
  });

  return accounts.map((account) => ({
    ...account,
    currentBalance: runningBalance[account.id] ?? account.currentBalance,
  }));
};

/** Atualiza o saldo de uma conta com base em uma movimentação.
 * @param accounts - Lista de contas atual.
 * @param movement - Movimentação a aplicar.
 * @returns Lista de contas com saldo atualizado.
 */
const applyMovementToAccounts = (
  accounts: Account[],
  movement: Movement
): Account[] => {
  if (movement.fromAccount && movement.toAccount) {
    const updated = [...accounts];
    const applyTransferDelta = (
      accountId: string,
      role: "FROM" | "TO"
    ): void => {
      const account = updated.find((current) => current.id === accountId);
      if (!account) {
        throw new Error("Conta informada não existe");
      }

      const isAsset = account.category === "ASSET";
      const isLiabilityOrEquity =
        account.category === "LIABILITY" || account.category === "EQUITY";

      const delta =
        role === "FROM"
          ? isAsset
            ? -movement.amount
            : movement.amount
          : isAsset
          ? movement.amount
          : isLiabilityOrEquity
          ? -movement.amount
          : movement.amount;

      const index = updated.findIndex((current) => current.id === accountId);
      updated[index] = {
        ...updated[index],
        currentBalance: updated[index].currentBalance + delta,
      };
    };

    applyTransferDelta(movement.fromAccount, "FROM");
    applyTransferDelta(movement.toAccount, "TO");

    return updated;
  }

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
 * @param date - Data alvo em dd/MM/yyyy.
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
const getAccounts = async (): Promise<Account[]> => {
  const [accounts, movements] = await Promise.all([
    fetchAccounts(),
    fetchMovements(),
  ]);
  return computeCurrentBalances(accounts, movements);
};

/** Lista os produtos cadastrados.
 * @returns Lista de produtos disponíveis.
 */
const getProducts = async (): Promise<Product[]> => fetchProducts();

/** Monta o balanço patrimonial com depreciação.
 * @returns Estrutura de balanço.
 */
const getBalanceSheet = async (
  from?: string,
  to?: string
): Promise<BalanceSheet> => {
  const [accounts, assets, movements] = await Promise.all([
    fetchAccounts(),
    fetchAssets(),
    fetchMovements(),
  ]);
  const movementsUntilDate = filterByDateRange(movements, undefined, to);
  const filteredMovements = filterByDateRange(movements, from, to);
  const accountsWithBalance = computeCurrentBalances(
    accounts,
    movementsUntilDate
  );
  const referenceDate = to ? getDayEnd(to) : Date.now();

  const assetLines: AssetBalanceLine[] = accountsWithBalance
    .filter((account) => account.category === "ASSET")
    .map((account) => {
      const relatedAssets = assets.filter(
        (asset) => asset.accountId === account.id
      );
      const rate = account.depreciationRateAnnual ?? 0;

      if (relatedAssets.length === 0) {
        const totalCost = account.currentBalance;

        return {
          accountId: account.id,
          accountName: account.name,
          depreciation: 0,
          netValue: totalCost,
          rate,
          totalCost,
        };
      }

      const depreciation = relatedAssets.reduce(
        (accumulator, asset) =>
          accumulator + calculateDepreciation(asset, rate, referenceDate),
        0
      );
      const totalCost = relatedAssets.reduce(
        (accumulator, asset) => accumulator + asset.cost,
        0
      );
      const netValue = Math.max(0, totalCost - depreciation);

      return {
        accountId: account.id,
        accountName: account.name,
        depreciation,
        netValue,
        rate,
        totalCost,
      };
    });

  const liabilityLines: AssetBalanceLine[] = accountsWithBalance
    .filter((account) => account.category === "LIABILITY")
    .map((account) => ({
      accountId: account.id,
      accountName: account.name,
      depreciation: 0,
      netValue: account.currentBalance,
      rate: 0,
      totalCost: account.currentBalance,
    }));

  const assetsTotal = assetLines.reduce(
    (accumulator, line) => accumulator + line.netValue,
    0
  );
  const liabilitiesTotal = liabilityLines.reduce(
    (accumulator, line) => accumulator + line.netValue,
    0
  );
  const equity = assetsTotal - liabilitiesTotal;

  return {
    assets: assetLines,
    date: referenceDate,
    equity,
    liabilities: liabilityLines,
    totals: {
      assets: assetsTotal,
      liabilities: liabilitiesTotal,
    },
  };
};

export {
  calculateDepreciation,
  applyMovementToAccounts,
  buildSummary,
  createMovement,
  getAccounts,
  getBalanceSheet,
  getDailySummary,
  getPeriodSummary,
  getProducts,
  listMovements,
};
