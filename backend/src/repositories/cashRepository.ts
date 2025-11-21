import path from "path";
import { Account } from "../models/Account";
import { Movement } from "../models/Movement";
import { Product } from "../models/Product";
import { readJsonFile, writeJsonFile } from "../utils/fileUtils";

const DATA_DIR = path.resolve(__dirname, "../../data");

const ACCOUNTS_PATH = path.join(DATA_DIR, "accounts.json");
const MOVEMENTS_PATH = path.join(DATA_DIR, "movements.json");
const MOVEMENTS_MOCK_PATH = path.join(DATA_DIR, "movementsMock.json");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");
const SHOULD_USE_MOCK = process.env.USE_MOCK_MOVEMENTS !== "false";

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

/** Recupera a lista de produtos mockados.
 * @returns Lista de produtos cadastrados.
 */
const fetchProducts = async (): Promise<Product[]> =>
  readJsonFile<Product[]>(PRODUCTS_PATH, []);

/** Lê as movimentações reais persistidas no disco.
 * @returns Movimentações efetivamente registradas.
 */
const fetchRealMovements = async (): Promise<Movement[]> =>
  readJsonFile<Movement[]>(MOVEMENTS_PATH, []);

/** Lê as movimentações mockadas para exibição.
 * @returns Movimentações fictícias para testes.
 */
const fetchMockMovements = async (): Promise<Movement[]> =>
  readJsonFile<Movement[]>(MOVEMENTS_MOCK_PATH, []);

/** Recupera as movimentações considerando a configuração de mock.
 * @returns Lista consolidada de movimentações.
 */
const fetchMovements = async (): Promise<Movement[]> => {
  const movements = await fetchRealMovements();

  if (movements.length > 0 || !SHOULD_USE_MOCK) {
    return movements;
  }

  return fetchMockMovements();
};

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
  const movements = await fetchRealMovements();
  movements.push(movement);
  await saveMovements(movements);

  return movement;
};

export {
  appendMovement,
  fetchAccounts,
  fetchMockMovements,
  fetchMovements,
  fetchProducts,
  saveAccounts,
  saveMovements,
};
