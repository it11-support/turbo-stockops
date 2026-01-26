import { Router } from "express";
import authRoute from "./auth/index.js";
import orderRoutes from "./orders/index.js";
import areaRoutes from "./area/index.js";
import customerRoutes from "./customers/index.js";
import userRoutes from "./user/index.js";
import pickListRoutes from "./picklist/index.js";
import PickListsRoutes from "./picklists/index.js";

const router = Router();

router.use("/user", authRoute);
router.use("/orders", orderRoutes);
router.use("/area", areaRoutes);
router.use("/customer", customerRoutes);
router.use("/user", userRoutes);
router.use("/picklist", pickListRoutes);
router.use("/picklists", PickListsRoutes);

export default router;
