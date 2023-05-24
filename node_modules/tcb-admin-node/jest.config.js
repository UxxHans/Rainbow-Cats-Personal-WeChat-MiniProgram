module.exports = {
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "transformIgnorePatterns": [
      "/node_modules/(?!@cloudbase).+\\.js$"
    ],
    globals: {
      'ts-jest': {
        isolatedModules: true
      },
    },
    "verbose": true,
    "testURL": "http://localhost/",
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "testEnvironment": "node",
    "setupTestFrameworkScriptFile": "<rootDir>/test/setup.js"
};
