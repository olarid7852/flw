import { Router } from "express";
import {
  saveFeeConfiguration,
  calculateTransactionFee,
} from "../controllers/index.controller.js";
import {
  configurationValidator,
  transactionValidator,
} from "../validators/index.js";

const router = new Router();
router.get("/status", (req, res) => {
  res.send({ status: true });
});

router.post("/fees", configurationValidator, saveFeeConfiguration);
router.post(
  "/compute-transaction-fee",
  transactionValidator,
  calculateTransactionFee
);

export default router;
