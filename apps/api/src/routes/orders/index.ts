import {
  activeOrderController,
  getOrderDetailsController,
  orderExportController,
  orderIdListController,
  orderListController,
} from "@/controllers/index.js";
import { authMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/", authMiddleware, orderListController);
router.get("/active", authMiddleware, activeOrderController);
router.get("/orderIds", authMiddleware, orderIdListController);

router.get("/:id", authMiddleware, getOrderDetailsController);
router.post("/export", authMiddleware, orderExportController);

export default router;
