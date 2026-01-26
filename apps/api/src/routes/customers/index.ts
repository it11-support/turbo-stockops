import { customerListController } from "@/controllers/index.js";
import { Router } from "express";
import { authMiddleware } from "@/utils/index.js";
const router = Router();

router.get("/" ,authMiddleware , customerListController);

export default router;
