import express, { Application, NextFunction, Request, Response } from "express";
import compression from "compression";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { config } from "@authentication/config";
import { verify } from "jsonwebtoken";
import { IAuthPayload } from "@muhammadjalil8481/jobber-shared";
import cloudinary from "cloudinary";

function initializeGlobalMiddleware(app: Application) {
  securityMiddleware(app);
  standardMiddleware(app);
  cloudinaryConfig();
}

function securityMiddleware(app: Application) {
  app.set("trust proxy", true); // Trust the first proxy (e.g., if behind a load balancer)
  app.use(hpp()); // Prevent HTTP Parameter Pollution
  app.use(helmet()); // Set various HTTP headers for security
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")?.[1];
      const payload: IAuthPayload = verify(
        token,
        config.JWT_TOKEN_SECRET
      ) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(express.json({ limit: "200mb" }));
  app.use(express.urlencoded({ limit: "200mb", extended: true }));
}

function cloudinaryConfig() {
  cloudinary.v2.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET,
  });
}

export { initializeGlobalMiddleware };
