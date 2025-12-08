/// <reference types="vitest" />

export default {
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage"
    }
  }
};
