import {
  getPickListController,
  getPickListDetailsController,
  pickListsDetailController,
  splitPickListController,
  storePickListController,
} from "@/controllers";
import { authMiddleware } from "@/utils";
import { Router } from "express";

const router = Router();

router.get("/:id/details", authMiddleware, pickListsDetailController);
router.get("/", getPickListController, authMiddleware);
router.post("/", storePickListController, authMiddleware);
router.get("/:id", getPickListDetailsController, authMiddleware);
router.post("/:id/split", splitPickListController, authMiddleware);

export default router;
