const baseConfig = require("@codeatlas/eslint-config/nest-flat");

module.exports = [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname
      }
    }
  }
];
