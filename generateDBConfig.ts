import { sequelieConfig } from "./src/database/sequelize.config";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

// target file path
const outputDir = path.resolve(__dirname, "src/database");
const outputPath = path.join(outputDir, "config.json");

// ensure the directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}

// write config.json
writeFileSync(outputPath, JSON.stringify(sequelieConfig, null, 2));

console.log(`✅ Sequelize config.json generated at: ${outputPath}`);
