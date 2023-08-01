/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "plugin:prettier/recommended",
    "@vue/eslint-config-prettier/skip-formatting"
    // "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    "function-call-argument-newline": ["error", "never"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "vue/max-len": [
      "error",
      {
        tabWidth: 2,
        code: 120,
        template: 120,
        comments: 120
      }
    ]
  }
};
