import { gigs, singleGigById } from "@authentication/controllers/search";
import { Router } from "express";

const router: Router = Router();

router.get("/api/v1/search/gigs", gigs);
router.get("/api/v1/search/gigs/:gigId", singleGigById);

export { router as searchRouter };
