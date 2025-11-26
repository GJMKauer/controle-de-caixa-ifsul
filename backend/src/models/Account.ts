export type AccountCategory = "ASSET" | "LIABILITY" | "EQUITY";

export interface Account {
  id: string;
  category: AccountCategory;
  currentBalance: number;
  depreciationRateAnnual?: number;
  initialBalance: number;
  name: string;
}
