export type ObjectOf<T> = { [key: string]: T };

/* Transforma um array em um dicionário de objetos (ObjectOf) */
export const objectify = <T>(list: Array<T>, indexKey?: string): ObjectOf<T> =>
  list.reduce((acc, value, index) => {
    if (typeof value === "object" && indexKey !== undefined) {
      acc[(value as { [key: string]: never })[indexKey]] = value;
    } else {
      acc[index] = value;
    }

    return acc;
  }, {} as ObjectOf<T>);
