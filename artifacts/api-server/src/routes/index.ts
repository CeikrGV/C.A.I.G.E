import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import idososRouter from "./idosos";
import prontuariosRouter from "./prontuarios";
import dashboardRouter from "./dashboard";
import agendamentosRouter from "./agendamentos";
import evolucoesRouter from "./evolucoes";
import frequenciasRouter from "./frequencias";
import desempenhoRouter from "./desempenho";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(idososRouter);
router.use(prontuariosRouter);
router.use(dashboardRouter);
router.use(agendamentosRouter);
router.use(evolucoesRouter);
router.use(frequenciasRouter);
router.use(desempenhoRouter);

export default router;
