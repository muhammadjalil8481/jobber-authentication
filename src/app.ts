import "express-async-errors"
import express from "express";
import { startServer } from "./server";
import { log } from "./logger";
import { initializeGlobalMiddleware } from "./middleware/globals.middleware";
import router from "./router";
import { errorHandlerMiddleware } from "@muhammadjalil8481/jobber-shared";

const app = express();

initializeGlobalMiddleware(app);

startServer(app);

app.use(router);

app.use(errorHandlerMiddleware({ log, serviceName: "Authentication Service" }));

export default app;
