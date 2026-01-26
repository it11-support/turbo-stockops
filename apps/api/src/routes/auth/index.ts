import { loginController } from "@/controllers";
import { Router } from "express";

const router = Router();

router.post("/login", loginController);

export default router;
