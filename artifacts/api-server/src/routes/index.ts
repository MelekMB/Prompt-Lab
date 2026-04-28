import { Router, type IRouter } from "express";
import healthRouter from "./health";
import promptloopRouter from "./promptloop";

const router: IRouter = Router();

router.use(healthRouter);
router.use(promptloopRouter);

export default router;
