import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import idososRouter from "./idosos";
import prontuariosRouter from "./prontuarios";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(idososRouter);
router.use(prontuariosRouter);
router.use(dashboardRouter);

export default router;
