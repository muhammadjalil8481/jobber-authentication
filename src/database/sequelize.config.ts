import { config } from "@authentication/config";
import { Options } from "sequelize";

type SequelizeConfig = Record<string, Options>;

const sequelieConfig: SequelizeConfig = {
  development: {
    dialect: "mysql",
    host: config.MYSQL_HOST,
    port: Number(config.MYSQL_PORT),
    username: config.MYSQL_USER,
    logging: false,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
    dialectOptions: {
      multipleStatements: true,
    },
  },
};

export { sequelieConfig };
