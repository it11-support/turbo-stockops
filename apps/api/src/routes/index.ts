import { Router } from "express";
import authRoute from "./auth/index.js";
import orderRoutes from "./orders/index.js";
import areaRoutes from "./area/index.js";
import customerRoutes from "./customers/index.js";
import userRoutes from "./user/index.js";
import pickListRoutes from "./picklist/index.js";
import PickListsRoutes from "./picklists/index.js";
import { apiLimiter } from "@/utils/index.js";

const router = Router();

router.use("/user", authRoute);
router.use("/orders", apiLimiter, orderRoutes);
router.use("/area", apiLimiter, areaRoutes);
router.use("/customer", apiLimiter, customerRoutes);
router.use("/user", userRoutes);
router.use("/picklist", apiLimiter, pickListRoutes);
router.use("/picklists", apiLimiter, PickListsRoutes);

export default router;
