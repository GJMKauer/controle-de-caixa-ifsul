import path from "path";
import { Asset } from "../models/Asset";
import { readJsonFile } from "../utils/fileUtils";

const DATA_DIR = path.resolve(__dirname, "../../data");
const ASSETS_PATH = path.join(DATA_DIR, "assets.json");

/** Recupera os bens cadastrados.
 * @returns Lista de ativos.
 */
const fetchAssets = async (): Promise<Asset[]> => readJsonFile<Asset[]>(ASSETS_PATH, []);

export { fetchAssets };
