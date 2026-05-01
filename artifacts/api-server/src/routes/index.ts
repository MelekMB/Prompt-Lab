import { Router, type IRouter } from "express";
import healthRouter from "./health";
import promptloopRouter from "./promptloop";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(promptloopRouter);

export default router;
