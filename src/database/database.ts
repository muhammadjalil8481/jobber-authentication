import { Sequelize } from "sequelize";
import { log } from "../logger";
import { sequelieConfig } from "./sequelize.config";

const sequelize = new Sequelize({
  ...sequelieConfig.development,
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

export { sequelize };
