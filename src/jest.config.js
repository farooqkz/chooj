/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // This handles non-ts imports in tests by ignoring them
    "\\.(scss|css|jpg|png|gif|svg|webp|webm|mp4|mov)$":
      "<rootDir>/__mocks__/ignore.mock.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babelConfig: {
          "plugins": [
            "inferno",
            // This transforms the babel-plugin-inferno injected import to require
            "@babel/plugin-transform-modules-commonjs"
          ]
        }
      },
    ]
  },
};
