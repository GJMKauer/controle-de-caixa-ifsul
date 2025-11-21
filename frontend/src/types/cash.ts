export type MovementType = "INCOME" | "OUTCOME";

export interface Movement {
  account: string;
  amount: number;
  date: number;
  description: string;
  id: string;
  productId?: string;
  type: MovementType;
}

export interface MovementPayload {
  account: string;
  amount: number;
  date: string;
  description: string;
  productId?: string;
  type: MovementType;
}

export interface Summary {
  balance: number;
  movements: Movement[];
  totalIncome: number;
  totalOutcome: number;
}

export interface Account {
  currentBalance: number;
  id: string;
  initialBalance: number;
  name: string;
}

export interface Product {
  account: string;
  id: string;
  name: string;
  unitPrice: number;
}
