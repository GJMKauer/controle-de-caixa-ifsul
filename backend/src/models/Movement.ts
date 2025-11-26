export type MovementType = "INCOME" | "OUTCOME";

export interface Movement {
  id: string;
  account: string;
  amount: number;
  date: number;
  description: string;
  fromAccount?: string;
  productId?: string;
  toAccount?: string;
  type: MovementType;
}
