import path from "path";
import { Asset } from "../models/Asset";
import { readJsonFile, writeJsonFile } from "../utils/fileUtils";

const DATA_DIR = path.resolve(__dirname, "../../data");
const ASSETS_PATH = path.join(DATA_DIR, "assets.json");

/** Recupera os bens cadastrados.
 * @returns Lista de ativos.
 */
const fetchAssets = async (): Promise<Asset[]> =>
  readJsonFile<Asset[]>(ASSETS_PATH, []);

/** Persiste a lista de bens.
 * @param assets - Ativos a salvar.
 * @returns Lista gravada.
 */
const saveAssets = async (assets: Asset[]): Promise<Asset[]> => {
  await writeJsonFile<Asset[]>(ASSETS_PATH, assets);

  return assets;
};

/** Adiciona um novo bem à lista persistida.
 * @param asset - Ativo a incluir.
 * @returns Ativo inserido.
 */
const addAsset = async (asset: Asset): Promise<Asset> => {
  const assets = await fetchAssets();
  assets.push(asset);
  await saveAssets(assets);

  return asset;
};

export { addAsset, fetchAssets, saveAssets };
