import {
  getPickListController,
  getPickListDetailsController,
  pickListsDetailController,
  splitPickListController,
  storePickListController,
  updatePrintStatusController,
} from "@/controllers/index.js";
import { authMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/:id/details", authMiddleware, pickListsDetailController);
router.get("/",authMiddleware ,getPickListController );
router.post("/",authMiddleware, storePickListController);
router.get("/:id" ,authMiddleware, getPickListDetailsController);
router.post("/:id/split", authMiddleware, splitPickListController);
router.post("/printed", authMiddleware, updatePrintStatusController);

export default router;
