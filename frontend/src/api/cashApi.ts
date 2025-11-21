import { httpClient } from "./httpClient";
import { Account, Movement, MovementPayload, Product, Summary } from "../types/cash";

export interface MovementFilters {
  from?: string;
  to?: string;
}

/** Lista movimentações com filtros opcionais.
 * @param filters - Datas inicial e final.
 * @returns Movimentações retornadas pela API.
 */
const listMovements = async (filters?: MovementFilters): Promise<Movement[]> => {
  const response = await httpClient.get<Movement[]>("/movements", { params: filters });

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
 * @param date - Data no formato YYYY-MM-DD.
 * @returns Totais do dia.
 */
const getDailySummary = async (date: string): Promise<Summary> => {
  const response = await httpClient.get<Summary>("/summary/daily", { params: { date } });

  return response.data;
};

/** Obtém resumo por período.
 * @param from - Data inicial.
 * @param to - Data final.
 * @returns Totais do intervalo.
 */
const getPeriodSummary = async (from?: string, to?: string): Promise<Summary> => {
  const response = await httpClient.get<Summary>("/summary/period", { params: { from, to } });

  return response.data;
};

/** Lista contas contábeis.
 * @returns Contas com saldos.
 */
const getAccounts = async (): Promise<Account[]> => {
  const response = await httpClient.get<Account[]>("/accounts");

  return response.data;
};

/** Lista produtos mockados.
 * @returns Produtos disponíveis.
 */
const getProducts = async (): Promise<Product[]> => {
  const response = await httpClient.get<Product[]>("/products");

  return response.data;
};

export { createMovement, getAccounts, getDailySummary, getPeriodSummary, getProducts, listMovements };
