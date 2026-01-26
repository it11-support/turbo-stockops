import { getPickListsController } from "@/controllers/index.js";
import { authMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/",authMiddleware , getPickListsController);

export default router;
