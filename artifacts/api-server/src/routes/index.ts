import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteContentRouter from "./site-content";
import themeRouter from "./theme";
import menuRouter from "./menu";
import galleryRouter from "./gallery";
import inquiriesRouter from "./inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(siteContentRouter);
router.use(themeRouter);
router.use(menuRouter);
router.use(galleryRouter);
router.use(inquiriesRouter);

export default router;
