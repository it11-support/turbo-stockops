import { loginController } from "@/controllers/index.js";
import { Router } from "express";

const router = Router();

router.post("/login", loginController);

export default router;
