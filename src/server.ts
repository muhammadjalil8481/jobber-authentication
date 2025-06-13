import { Application } from "express";
import { config } from "./config";
import { log } from "./logger";
import { checkDatabaseConnection } from "./database/database";
import { elasticsearch } from "./elasticsearch";
import { Channel } from "amqplib";
import { createConnection } from "./queues/connection";

const SERVER_PORT = config.PORT || 4002;
export let rabbitMQChannel: Channel;

function startServer(app: Application) {
  try {
    app.listen(config.PORT, async () => {
      log.info(`Authentication service running on port ${SERVER_PORT}`);
      elasticsearch.checkConnection();
      checkDatabaseConnection();
      rabbitMQChannel = (await createConnection()) as Channel;
    });
  } catch (error) {
    log.error(`Authentication service error startServer() Error : `, error);
  }
}

export { startServer };
