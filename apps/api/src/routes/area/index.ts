import { areaListController } from "@/controllers/area/index.js";
import { authMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/", authMiddleware, areaListController);

export default router;
