import { Logger } from "winston";
import { LogLevel, winstonLogger } from "@muhammadjalil8481/jobber-shared";
// import { config } from "./config";

const log: Logger = winstonLogger({
  name: "authentication-service",
  level: LogLevel.DEBUG,
  //   elasticSearchNode: config.ELASTIC_SEARCH_URL,
});


export { log };
