/**
 * Formata um valor numérico em Real brasileiro (BRL).
 *
 * @param value - Valor numérico a ser formatado.
 * @returns Valor formatado com símbolo de moeda.
 */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency"
  }).format(value);

/**
 * Formata um timestamp em dd/MM/yyyy.
 *
 * @param timestamp - Timestamp em milissegundos.
 * @returns Data formatada.
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  return date.toLocaleDateString("pt-BR");
};

/**
 * Converte um timestamp em string compatível com campo date.
 *
 * @param timestamp - Timestamp em milissegundos.
 * @returns String no formato YYYY-MM-DD.
 */
const toInputDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Obtém a data atual no formato compatível com input date.
 *
 * @returns String no formato YYYY-MM-DD.
 */
const getTodayInputDate = (): string => toInputDate(Date.now());

export { formatCurrency, formatDate, getTodayInputDate, toInputDate };
