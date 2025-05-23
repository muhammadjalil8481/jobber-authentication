import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
// import { StatusCodes } from "http-status-codes";
import { NotAuthorizedError } from "@muhammadjalil8481/jobber-shared";
import { log } from "@authentication/logger";

const publicKey = fs.readFileSync("../public.pem", "utf-8");

export const GatewayRequestVerification = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers["x-gateway-token"] as string;

    const verifier = crypto.createVerify("SHA256");
    verifier.end();

    const isValid = verifier.verify(publicKey, signature, "base64");

    if (isValid) {
      throw new NotAuthorizedError(
        "Unauthorized request",
        "GatewayRequestVerification method()"
      );
    }

    next();
  } catch (error) {
    log.error("Unexpected Error GatewayRequestVerification method", error);
    throw new NotAuthorizedError(
      "Unauthorized request",
      "GatewayRequestVerification method()"
    );
  }
};
