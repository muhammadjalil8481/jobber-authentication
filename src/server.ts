import { Application } from "express";
import { config } from "./config";
import { log } from "./logger";
import { checkDatabaseConnection } from "./database";
import { elasticsearch } from "./elasticsearch";

const SERVER_PORT = config.PORT || 4002;

function startServer(app: Application) {
  try {
    app.listen(config.PORT, () => {
      log.info(`Authentication service running on port ${SERVER_PORT}`);
        elasticsearch.checkConnection();
      checkDatabaseConnection();
    });
  } catch (error) {
    log.error(`Authentication service error startServer() Error : `, error);
  }
}

export { startServer };
