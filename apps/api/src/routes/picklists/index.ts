import { getPickListsController } from "@/controllers";
import { authMiddleware } from "@/utils";
import { Router } from "express";

const router = Router();

router.get("/", getPickListsController, authMiddleware);

export default router;
