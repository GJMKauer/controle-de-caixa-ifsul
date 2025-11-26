export type MovementType = "INCOME" | "OUTCOME";

export interface Movement {
  account: string;
  amount: number;
  date: number;
  description: string;
  fromAccount?: string;
  id: string;
  productId?: string;
  toAccount?: string;
  type: MovementType;
}

export interface MovementPayload {
  account: string;
  amount: number;
  date: string;
  description: string;
  fromAccount?: string;
  productId?: string;
  toAccount?: string;
  type: MovementType;
}

export interface Summary {
  balance: number;
  movements: Array<Movement>;
  totalIncome: number;
  totalOutcome: number;
}

export interface Account {
  category: "ASSET" | "EQUITY" | "LIABILITY";
  currentBalance: number;
  depreciationRateAnnual?: number;
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

export interface Asset {
  accountId: string;
  acquisitionDate: number;
  cost: number;
  id: string;
  name: string;
}

export interface AssetInput {
  accountId: string;
  acquisitionDate: string;
  cost: number;
  name: string;
}

export interface BalanceLine {
  accountId: string;
  accountName: string;
  depreciation: number;
  netValue: number;
  rate: number;
  totalCost: number;
}

export interface BalanceSheet {
  assets: Array<BalanceLine>;
  date: number;
  equity: number;
  liabilities: Array<BalanceLine>;
  totals: {
    assets: number;
    liabilities: number;
  };
}
