import { areaListController } from "@/controllers/area";
import { authMiddleware } from "@/utils";
import { Router } from "express";

const router = Router();

router.get("/", areaListController, authMiddleware);

export default router;
