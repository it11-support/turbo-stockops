import {
  deleteUserController,
  getPickersController,
  userListController,
  userRegisterController,
  userUpdateController,
} from "@/controllers/index.js";
import { authMiddleware, roleMiddleware } from "@/utils/index.js";
import { Router } from "express";

const router = Router();

router.get("/", authMiddleware, userListController);
router.get("/pickers", authMiddleware, getPickersController);
router.post(
  "/register",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  userRegisterController,
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  userUpdateController,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  deleteUserController,
);

export default router;
