module.exports = {
  roots: ['<rootDir>/test'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules'],
  testEnvironment: 'node',
  // https://github.com/facebook/jest/issues/5164
  // globalSetup: './test/global-setup-hook.js',
  // globalTeardown: './test/global-teardown-hook.js',
  coverageReporters: ['json', 'lcov', 'clover', 'text-summary'],
  coveragePathIgnorePatterns: ['/lib/']
}
