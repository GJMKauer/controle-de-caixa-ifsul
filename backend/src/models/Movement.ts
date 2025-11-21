export type MovementType = "INCOME" | "OUTCOME";

export interface Movement {
  id: string;
  account: string;
  amount: number;
  date: number;
  description: string;
  productId?: string;
  type: MovementType;
}
