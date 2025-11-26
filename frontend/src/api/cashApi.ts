import { httpClient } from "./httpClient";
import { Account, BalanceSheet, Movement, MovementPayload, Product, Summary } from "../types/cash";

export interface MovementFilters {
  from?: string;
  to?: string;
}

/** Lista movimentações com filtros opcionais.
 * @param filters - Datas inicial e final.
 * @returns Movimentações retornadas pela API.
 */
const listMovements = async (filters?: MovementFilters): Promise<Array<Movement>> => {
  const response = await httpClient.get<Array<Movement>>("/movements", {
    params: filters,
  });

  return response.data;
};

/** Cria uma nova movimentação.
 * @param payload - Dados do formulário.
 * @returns Movimentação criada.
 */
const createMovement = async (payload: MovementPayload): Promise<Movement> => {
  const response = await httpClient.post<Movement>("/movements", payload);

  return response.data;
};

/** Obtém resumo diário.
 * @param date - Data no formato dd/MM/yyyy.
 * @returns Totais do dia.
 */
const getDailySummary = async (date: string): Promise<Summary> => {
  const response = await httpClient.get<Summary>("/summary/daily", {
    params: { date },
  });

  return response.data;
};

/** Obtém resumo por período.
 * @param from - Data inicial.
 * @param to - Data final.
 * @returns Totais do intervalo.
 */
const getPeriodSummary = async (from?: string, to?: string): Promise<Summary> => {
  const response = await httpClient.get<Summary>("/summary/period", {
    params: { from, to },
  });

  return response.data;
};

/** Lista contas contábeis.
 * @returns Contas com saldos.
 */
const getAccounts = async (): Promise<Array<Account>> => {
  const response = await httpClient.get<Array<Account>>("/accounts");

  return response.data;
};

/** Lista produtos disponíveis.
 * @returns Produtos disponíveis.
 */
const getProducts = async (): Promise<Array<Product>> => {
  const response = await httpClient.get<Array<Product>>("/products");

  return response.data;
};

/** Obtém balanço patrimonial com depreciação.
 * @returns Balanço consolidado.
 */
const getBalanceSheet = async (month?: string): Promise<BalanceSheet> => {
  const filters =
    month && month.includes("-")
      ? (() => {
          const [year, monthPart] = month.split("-");
          const start = `01/${monthPart}/${year}`;
          const endDate = new Date(Number(year), Number(monthPart), 0);
          const end = `${String(endDate.getDate()).padStart(2, "0")}/${monthPart}/${year}`;

          return { from: start, to: end };
        })()
      : undefined;

  const response = await httpClient.get<BalanceSheet>("/balance", { params: filters });

  return response.data;
};

export { createMovement, getAccounts, getBalanceSheet, getDailySummary, getPeriodSummary, getProducts, listMovements };
