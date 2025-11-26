/** Formata um valor numérico em Real brasileiro (BRL).
 * @param value - Valor numérico a ser formatado.
 * @returns Valor formatado com símbolo de moeda.
 */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);

/** Formata um timestamp em dd/MM/yyyy.
 * @param timestamp - Timestamp em milissegundos.
 * @returns Data formatada.
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/** Converte um timestamp em string de exibição dd/MM/yyyy.
 * @param timestamp - Timestamp em milissegundos.
 * @returns String no formato dd/MM/yyyy.
 */
const toInputDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/** Obtém a data atual no formato dd/MM/yyyy.
 * @returns String no formato dd/MM/yyyy.
 */
const getTodayInputDate = (): string => {
  const now = new Date();
  const day = `${now.getDate()}`.padStart(2, "0");
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
};

/** Converte datas no formato ISO para dd/MM/yyyy.
 * @param value - Valor digitado.
 * @returns Data normalizada.
 */
const normalizeDate = (value: string): string => {
  const trimmed = value.trim();
  const dashMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dashMatch) {
    const [, year, month, day] = dashMatch;

    return `${day}/${month}/${year}`;
  }

  return trimmed;
};

/** Capitaliza a primeira letra de cada palavra e remove hífens.
 * @param value - Texto de entrada.
 * @returns Texto com iniciais maiúsculas.
 */
const capitalize = (value: string): string =>
  value
    ? value
        .split(/[-_\\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : value;

/** Aplica máscara de data (dd/MM/yyyy) sobre o valor digitado.
 * @param value - Texto de entrada.
 * @returns Valor com máscara.
 */
const applyDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (!digits) {
    return "";
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  const parts = [day, month, year].filter(Boolean);

  return parts
    .map((part, index) => {
      if (index === 0 || index === 1) {
        return part.slice(0, 2);
      }
      return part.slice(0, 4);
    })
    .join("/")
    .slice(0, 10);
};

export { applyDateMask, capitalize, formatCurrency, formatDate, getTodayInputDate, normalizeDate, toInputDate };
