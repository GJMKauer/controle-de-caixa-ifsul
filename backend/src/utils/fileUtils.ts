import fs from "fs/promises";
import path from "path";

/** Garante que o diretório de um arquivo exista.
 * @param filePath - Caminho do arquivo alvo.
 * @returns Diretório existente.
 */
const ensureDirectory = async (filePath: string): Promise<string> => {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });

  return directory;
};

/**Lê um arquivo JSON e retorna o conteúdo ou um valor padrão.
 * @param filePath - Caminho absoluto do arquivo JSON.
 * @param fallback - Valor padrão caso o arquivo não exista ou esteja vazio.
 * @returns Conteúdo do arquivo ou o fallback informado.
 */
const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    if (!content.trim()) {
      await writeJsonFile(filePath, fallback);

      return fallback;
    }

    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await ensureDirectory(filePath);
      await writeJsonFile(filePath, fallback);

      return fallback;
    }

    throw error;
  }
};

/** Escreve dados em um arquivo JSON com indentação.
 * @param filePath - Caminho absoluto do arquivo JSON.
 * @param data - Dados a serem gravados.
 * @returns Caminho do arquivo gravado.
 */
const writeJsonFile = async <T>(filePath: string, data: T): Promise<string> => {
  await ensureDirectory(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  return filePath;
};

export { ensureDirectory, readJsonFile, writeJsonFile };
