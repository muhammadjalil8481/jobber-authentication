import {
  createConfig,
} from "@muhammadjalil8481/jobber-shared";
import dotenv from "dotenv";

dotenv.config();

const envList = [
  "NODE_ENV",
  "PORT",
  "GATEWAY_JWT_TOKEN",
  "JWT_TOKEN_SECRET",
  "API_GATEWAY_URL",
  "RABBITMQ_ENDPOINT",
  "MYSQL_HOST",
  "MYSQL_PORT",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DATABASE",
  "CLIENT_URL",
  "ELASTIC_SEARCH_URL",
  "ELASTIC_APM_SERVER_URL",
  "CLOUD_NAME",
  "CLOUD_API_KEY",
  "CLOUD_API_SECRET" 
] as const;



export const config = createConfig(envList);
