module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  plugins: ["html"],
  extends: ["eslint:recommended"],
  ignorePatterns: ["node_modules/", "dist/"],
  globals: {
    L: "readonly",
    fetch: "readonly",
    window: "readonly",
    document: "readonly"
  },
  overrides: [
    {
      files: ["test/**/*.js"],
      env: {
        node: true
      },
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly"
      }
    }
  ],
  rules: {
    "no-unused-vars": ["warn", { args: "none" }],
    "no-undef": "error"
  }
};
