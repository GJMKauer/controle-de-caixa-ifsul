import { Router } from "express";
import {
  handleBalanceSheet,
  handleCreateMovement,
  handleDailySummary,
  handleListAccounts,
  handleListMovements,
  handleListProducts,
  handlePeriodSummary
} from "../controllers/cashController";

const router = Router();

// Movements
router.get("/movements", handleListMovements);
router.post("/movements", handleCreateMovement);

// Summaries
router.get("/summary/daily", handleDailySummary);
router.get("/summary/period", handlePeriodSummary);
router.get("/balance", handleBalanceSheet);

// Accounts and assets
router.get("/accounts", handleListAccounts);

// Products
router.get("/products", handleListProducts);

export default router;
