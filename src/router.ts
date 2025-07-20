import { Request, Response, Router } from "express";
import { authRouter } from "./routes/auth";
import { GatewayRequestVerification } from "@muhammadjalil8481/jobber-shared";
import { log } from "./logger";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { searchRouter } from "./routes/search";
import { seedRouter } from "./routes/seed";

const publicKey = fs.readFileSync("./public.pem", "utf-8");
const gatewayMiddleware = GatewayRequestVerification(log, publicKey);

const router = Router();

router.get("/auth-health", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).send("Auth service is healthy and OK.");
});

router.use(gatewayMiddleware, authRouter);
router.use(gatewayMiddleware, searchRouter);
router.use(gatewayMiddleware, seedRouter);

router.use("*", (req: Request, res: Response) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  log.error(`Auth service error: ${url} does not exist`);
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Url Not Found",
  });
});

export default router;
