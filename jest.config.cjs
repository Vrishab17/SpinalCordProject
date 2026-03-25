const path = require("path");
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: path.join(__dirname, "spinal-cord-assessment"),
});

module.exports = createJestConfig({
  rootDir: __dirname,
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: [path.join(__dirname, "jest.setup.js")],
  testMatch: [path.join(__dirname, "sum.test.js")],
  moduleNameMapper: {
    "^@/(.*)$": path.join(
      __dirname,
      "spinal-cord-assessment",
      "src",
      "$1"
    ),
  },
});
