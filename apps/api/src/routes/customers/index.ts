import { customerListController } from "@/controllers";
import { Router } from "express";
import { authMiddleware } from "@/utils";
const router = Router();

router.get("/", customerListController, authMiddleware);

export default router;
