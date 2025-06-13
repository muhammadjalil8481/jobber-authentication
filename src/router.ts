import { Request, Response, Router } from "express";
import { router as authRouter } from "./routes/auth";
import { GatewayRequestVerification } from "@muhammadjalil8481/jobber-shared";
import { log } from "./logger";
import fs from "fs";
import { StatusCodes } from "http-status-codes";

const publicKey = fs.readFileSync("./public.pem", "utf-8");
// const BASE_PATH = "/api/v1/auth";
const gatewayMiddleware = GatewayRequestVerification(log, publicKey);

const router = Router();

router.use(gatewayMiddleware,authRouter);

router.use("*", (req: Request, res: Response) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  log.error(`Gateway service error: ${url} does not exist`);
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Url Not Found",
  });
});

export default router;
