import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteContentRouter from "./site-content";
import themeRouter from "./theme";
import menuRouter from "./menu";
import galleryRouter from "./gallery";
import inquiriesRouter from "./inquiries";
import authRouter from "./auth";
import ordersRouter from "./orders";
import adminUsersRouter from "./admin-users";
import branchesRouter from "./branches";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(siteContentRouter);
router.use(themeRouter);
router.use(menuRouter);
router.use(galleryRouter);
router.use(inquiriesRouter);
router.use(authRouter);
router.use(ordersRouter);
router.use(adminUsersRouter);
router.use(branchesRouter);
router.use(analyticsRouter);

export default router;
