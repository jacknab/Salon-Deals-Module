import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dealsRouter from "./deals";
import favoritesRouter from "./favorites";
import vouchersRouter from "./vouchers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dealsRouter);
router.use(favoritesRouter);
router.use(vouchersRouter);

export default router;
