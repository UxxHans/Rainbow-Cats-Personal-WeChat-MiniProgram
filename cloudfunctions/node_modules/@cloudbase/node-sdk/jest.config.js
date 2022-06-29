module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    transformIgnorePatterns: ['/node_modules/(?!@cloudbase).+\\.js$'],
    globals: {
        'ts-jest': {
            isolatedModules: true,
            tsConfig: 'tsconfig.test.json'
        }
    },
    verbose: true,
    testURL: 'http://localhost/',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    setupTestFrameworkScriptFile: '<rootDir>/test/setup.js',
    coverageReporters: ['json', 'lcov', 'clover', 'text-summary'],
    coveragePathIgnorePatterns: [
        //  该路径下的测试，忽略在测试覆盖率上
        'lib',
        'test/common',
        'test/config.local.js'
    ]
}
