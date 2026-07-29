import {
  deleteUserController,
  getPickersController,
  userListController,
  userRegisterController,
  userUpdateController,
} from "@/controllers/index.js";
import { apiLimiter, authLimiter, authMiddleware, roleMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/", apiLimiter, authMiddleware, userListController);
router.get("/pickers", apiLimiter, authMiddleware, getPickersController);
router.post(
  "/register",
  authLimiter,
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  userRegisterController,
);
router.put(
  "/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  userUpdateController,
);
router.delete(
  "/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  deleteUserController,
);

export default router;
