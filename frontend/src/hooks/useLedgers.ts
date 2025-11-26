import { useMemo } from "react";
import { LedgerEntry } from "../components/balance/LedgerTable";
import { Account, Movement } from "../types/cash";

export type LedgerMap = Record<
  string,
  { closingBalance: number; credits: Array<LedgerEntry>; debits: Array<LedgerEntry> }
>;

/** Retorna o lado (débito/crédito) apropriado para uma movimentação em uma conta.
 * @param category - Categoria da conta.
 * @param type - Tipo da movimentação.
 * @returns Lado da movimentação.
 */
const getSideForMovement = (category: Account["category"], type: Movement["type"]): "DEBIT" | "CREDIT" => {
  if (category === "ASSET") {
    return type === "INCOME" ? "DEBIT" : "CREDIT";
  }

  return type === "INCOME" ? "CREDIT" : "DEBIT";
};

/** Retorna o lado (débito/crédito) apropriado para um delta em uma conta.
 * @param category - Categoria da conta.
 * @param delta - Tipo de variação (aumento/diminuição).
 * @returns Lado da variação.
 */
const getSideForDelta = (category: Account["category"], delta: "INCREASE" | "DECREASE"): "DEBIT" | "CREDIT" => {
  const isAsset = category === "ASSET";
  const isIncrease = delta === "INCREASE";

  if (isAsset) {
    return isIncrease ? "DEBIT" : "CREDIT";
  }

  return isIncrease ? "CREDIT" : "DEBIT";
};

interface UseLedgersParams {
  accountById: Record<string, Account>;
  accounts: Array<Account>;
  movements: Array<Movement>;
}

/** Hook para gerar razonetes por conta com SI, movimentações, SF e espelhamento simples entre clientes/fornecedores.
 * @param accountById - Mapeamento de contas por ID.
 * @param accounts - Contas disponíveis.
 * @param movements - Movimentações a serem processadas.
 * @returns Razonetes por conta com saldo final calculado.
 */
const useLedgers = (params: UseLedgersParams): LedgerMap => {
  const { accountById, accounts, movements } = params;

  return useMemo(() => {
    const map = accounts.reduce<LedgerMap>((accumulator, account) => {
      const initialSide = account.category === "ASSET" ? "DEBIT" : "CREDIT";
      accumulator[account.id] = {
        closingBalance: account.initialBalance,
        credits: [],
        debits: [],
      };

      const push = (side: "DEBIT" | "CREDIT", entry: LedgerEntry): void => {
        accumulator[account.id][side === "DEBIT" ? "debits" : "credits"].push(entry);
      };

      push(initialSide, { amount: account.initialBalance, description: "Saldo inicial", id: "SI" });

      return accumulator;
    }, {});

    const runningBalance = accounts.reduce<Record<string, number>>((accumulator, account) => {
      accumulator[account.id] = account.initialBalance;

      return accumulator;
    }, {});

    const runningDebits = accounts.reduce<Record<string, number>>((accumulator, account) => {
      accumulator[account.id] = account.category === "ASSET" ? account.initialBalance : 0;

      return accumulator;
    }, {});

    const runningCredits = accounts.reduce<Record<string, number>>((accumulator, account) => {
      accumulator[account.id] = account.category === "ASSET" ? 0 : account.initialBalance;

      return accumulator;
    }, {});

    const sortedMovements = [...movements].sort((first, second) => first.date - second.date);

    const applyDelta = (account: Account, accountId: string, side: "DEBIT" | "CREDIT", amount: number): void => {
      const isAsset = account.category === "ASSET";
      const factor = isAsset ? 1 : -1;
      runningBalance[accountId] += (side === "DEBIT" ? amount : -amount) * factor;
      if (side === "DEBIT") {
        runningDebits[accountId] += amount;
      } else {
        runningCredits[accountId] += amount;
      }
    };

    const pushEntry = (accountId: string, side: "DEBIT" | "CREDIT", entry: LedgerEntry): void => {
      map[accountId][side === "DEBIT" ? "debits" : "credits"].push(entry);
      const account = accountById[accountId];
      if (account) {
        applyDelta(account, accountId, side, entry.amount);
      }
    };

    sortedMovements.forEach((movement, index) => {
      const entryId = `#${index + 1}`;
      if (movement.fromAccount && movement.toAccount) {
        const fromAccount = accountById[movement.fromAccount];
        const toAccount = accountById[movement.toAccount];

        if (!fromAccount || !toAccount) {
          return;
        }

        const baseEntry: LedgerEntry = {
          amount: movement.amount,
          description: movement.description,
          id: entryId,
        };

        const fromSide = getSideForDelta(fromAccount.category, "DECREASE");
        const toSide = getSideForDelta(toAccount.category, "INCREASE");

        pushEntry(movement.fromAccount, fromSide, baseEntry);
        pushEntry(movement.toAccount, toSide, baseEntry);

        return;
      }

      const account = accountById[movement.account];
      if (!account) {
        return;
      }

      const side = getSideForMovement(account.category, movement.type);
      const entry: LedgerEntry = { amount: movement.amount, description: movement.description, id: entryId };
      const sideKey = side === "DEBIT" ? "debits" : "credits";
      map[movement.account][sideKey].push(entry);
      applyDelta(account, movement.account, side, movement.amount);

      const counterId = movement.type === "INCOME" ? "clientes" : "fornecedores";
      const counterAccount = accountById[counterId];
      if (counterAccount && counterId !== movement.account) {
        const counterSide: "DEBIT" | "CREDIT" = side === "DEBIT" ? "CREDIT" : "DEBIT";
        const counterEntry: LedgerEntry = { ...entry };
        map[counterId][counterSide === "DEBIT" ? "debits" : "credits"].push(counterEntry);
        applyDelta(counterAccount, counterId, counterSide, movement.amount);
      }
    });

    Object.entries(runningBalance).forEach(([accountId, currentBalance]) => {
      const account = accountById[accountId];
      if (!account) {
        return;
      }

      const debitTotal = runningDebits[accountId];
      const creditTotal = runningCredits[accountId];
      const net = account.category === "ASSET" ? debitTotal - creditTotal : creditTotal - debitTotal;
      const balanceSide = net >= 0 ? "CREDIT" : "DEBIT";
      const closingAmount = Math.abs(net);
      const finalEntry: LedgerEntry = {
        amount: closingAmount,
        description: "Saldo final",
        id: "SF",
      };

      map[accountId].closingBalance = currentBalance;
      map[accountId][balanceSide === "DEBIT" ? "debits" : "credits"].push(finalEntry);
    });

    return map;
  }, [accountById, accounts, movements]);
};

export { useLedgers };
