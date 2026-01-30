const path = require("path");
const nextConfig = require("eslint-config-next");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  ...nextConfig,
  {
    plugins: {
      "react-hooks": reactHooks
    },
    languageOptions: {
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json")
      }
    },
    rules: {
      "react-hooks/set-state-in-effect": "error"
    }
  }
];
