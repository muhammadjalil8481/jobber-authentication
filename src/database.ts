import { Sequelize } from "sequelize";
import { log } from "./logger";
import { config } from "./config";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: config.MYSQL_HOST,
  port: Number(config.MYSQL_PORT),
  username: config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DATABASE,
  logging: false,
  dialectOptions: {
    multipleStatements: true,
  },
});

export async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    log.info(
      "Auth Service MySQL DatabaseConnection has been established successfully."
    );
  } catch (error) {
    log.error(
      "Auth Service CheckConnection Method : Unable to connect to the database:",
      error
    );
    process.exit(1);
  }
}
