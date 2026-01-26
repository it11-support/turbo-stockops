import { Router } from "express";
import authRoute from "./auth";
import orderRoutes from "./orders";
import areaRoutes from "./area";
import customerRoutes from "./customers";
import userRoutes from "./user";
import pickListRoutes from "./picklist";
import PickListsRoutes from "./picklists";

const router = Router();

router.use("/user", authRoute);
router.use("/orders", orderRoutes);
router.use("/area", areaRoutes);
router.use("/customer", customerRoutes);
router.use("/user", userRoutes);
router.use("/picklist", pickListRoutes);
router.use("/picklists", PickListsRoutes);

export default router;
