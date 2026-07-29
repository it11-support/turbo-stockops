import { loginController } from "@/controllers/index.js";
import { authLimiter } from "@/utils/middlewares/index.js";
import { Router } from "express";

const router = Router();

router.post("/login", authLimiter, loginController);

export default router;
