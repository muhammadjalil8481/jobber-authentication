import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  coverageDirectory: "coverage",
  collectCoverage: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/test/*.ts"], // any file in test folder with .ts extension
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/test/*.ts?(x)",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },
  coverageReporters: ["text-summary", "lcov"],
  moduleNameMapper: {
    "@authentication/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
