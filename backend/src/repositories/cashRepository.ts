import path from "path";
import { Account } from "../models/Account";
import { Movement } from "../models/Movement";
import { Product } from "../models/Product";
import { readJsonFile, writeJsonFile } from "../utils/fileUtils";

const DATA_DIR = path.resolve(__dirname, "../../data");

const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const MOVEMENTS_PATH = path.join(DATA_DIR, "movements.json");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");

/** Recupera todas as contas cadastradas.
 * @returns Lista de contas.
 */
const fetchAccounts = async (): Promise<Account[]> =>
  readJsonFile<Account[]>(ACCOUNTS_PATH, []);

/** Persiste a lista de contas atualizada.
 * @param accounts - Coleção de contas com saldos atualizados.
 * @returns Lista gravada.
 */
const saveAccounts = async (accounts: Account[]): Promise<Account[]> => {
  await writeJsonFile<Account[]>(ACCOUNTS_PATH, accounts);

  return accounts;
};

/** Recupera a lista de produtos cadastrados.
 * @returns Lista de produtos cadastrados.
 */
const fetchProducts = async (): Promise<Product[]> =>
  readJsonFile<Product[]>(PRODUCTS_PATH, []);

/** Lê as movimentações persistidas no disco.
 * @returns Movimentações efetivamente registradas.
 */
const fetchMovements = async (): Promise<Movement[]> =>
  readJsonFile<Movement[]>(MOVEMENTS_PATH, []);

/** Persiste a lista de movimentações fornecida.
 * @param movements - Movimentações a salvar.
 * @returns Lista gravada.
 */
const saveMovements = async (movements: Movement[]): Promise<Movement[]> => {
  await writeJsonFile<Movement[]>(MOVEMENTS_PATH, movements);

  return movements;
};

/** Adiciona uma nova movimentação e salva no disco.
 * @param movement - Movimentação a ser registrada.
 * @returns Movimentação persistida.
 */
const appendMovement = async (movement: Movement): Promise<Movement> => {
  const movements = await fetchMovements();
  movements.push(movement);
  await saveMovements(movements);

  return movement;
};

export {
  appendMovement,
  fetchAccounts,
  fetchMovements,
  fetchProducts,
  saveAccounts,
  saveMovements,
};
