import { Request, Response } from "express";
import {
  createAsset,
  createMovement,
  getAccounts,
  getBalanceSheet,
  getDailySummary,
  getPeriodSummary,
  getProducts,
  listMovements,
} from "../services/cashService";

/** Handler para listagem de movimentações com filtros de data.
 * @param request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Resposta JSON com as movimentações encontradas.
 */
const handleListMovements = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const { from, to } = request.query;
    const movements = await listMovements(
      typeof from === "string" ? from : undefined,
      typeof to === "string" ? to : undefined
    );

    return response.json(movements);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

/** Handler para criação de uma nova movimentação.
 * @param request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Movimentação criada.
 */
const handleCreateMovement = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const movement = await createMovement(request.body);

    return response.status(201).json(movement);
  } catch (error) {
    return response.status(400).json({ message: (error as Error).message });
  }
};

/** Handler para criação de um ativo patrimonial.
 * @param request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Ativo criado.
 */
const handleCreateAsset = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const asset = await createAsset(request.body);

    return response.status(201).json(asset);
  } catch (error) {
    return response.status(400).json({ message: (error as Error).message });
  }
};

/** Handler para balanço patrimonial.
 * @param _request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Balanço consolidado.
 */
const handleBalanceSheet = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const { from, to } = request.query;
    const balance = await getBalanceSheet(
      typeof from === "string" ? from : undefined,
      typeof to === "string" ? to : undefined
    );

    return response.json(balance);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

/** Handler para resumo diário.
 * @param request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Totais do dia.
 */
const handleDailySummary = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const { date } = request.query;

    if (typeof date !== "string") {
      return response
        .status(400)
        .json({ message: "Parâmetro 'date' é obrigatório" });
    }

    const summary = await getDailySummary(date);

    return response.json(summary);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

/** Handler para resumo por período.
 * @param request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Totais do intervalo.
 */
const handlePeriodSummary = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const { from, to } = request.query;
    const summary = await getPeriodSummary(
      typeof from === "string" ? from : undefined,
      typeof to === "string" ? to : undefined
    );

    return response.json(summary);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

/** Handler para consulta de contas.
 * @param _request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Lista de contas.
 */
const handleListAccounts = async (
  _request: Request,
  response: Response
): Promise<Response> => {
  try {
    const accounts = await getAccounts();

    return response.json(accounts);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

/** Handler para consulta de produtos.
 * @param _request - Objeto Request do Express.
 * @param response - Objeto Response do Express.
 * @returns Lista de produtos cadastrados.
 */
const handleListProducts = async (
  _request: Request,
  response: Response
): Promise<Response> => {
  try {
    const products = await getProducts();

    return response.json(products);
  } catch (error) {
    return response.status(500).json({ message: (error as Error).message });
  }
};

export {
  handleBalanceSheet,
  handleCreateAsset,
  handleCreateMovement,
  handleDailySummary,
  handleListAccounts,
  handleListMovements,
  handleListProducts,
  handlePeriodSummary,
};
