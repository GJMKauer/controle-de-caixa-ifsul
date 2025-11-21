import { Router } from "express";
import {
  handleCreateMovement,
  handleDailySummary,
  handleListAccounts,
  handleListMovements,
  handleListProducts,
  handlePeriodSummary,
} from "../controllers/cashController";

const router = Router();

// Movements
router.get("/movements", handleListMovements);
router.post("/movements", handleCreateMovement);

// Summaries
router.get("/summary/daily", handleDailySummary);
router.get("/summary/period", handlePeriodSummary);

// Accounts
router.get("/accounts", handleListAccounts);

// Products
router.get("/products", handleListProducts);

export default router;
