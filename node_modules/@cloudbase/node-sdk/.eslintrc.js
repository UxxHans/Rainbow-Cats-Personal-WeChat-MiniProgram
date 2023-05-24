module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    rules: {},
    env: {
        es6: true,
        node: true,
        jest: true
    },
    overrides: [
        {
            files: ['*.ts', '*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/prefer-optional-chain': 'off',
                '@typescript-eslint/no-require-imports': 'off',
                'max-params': 'off',
                'no-param-reassign': 'off',
                '@typescript-eslint/no-this-alias': 'off',
                '@typescript-eslint/no-duplicate-imports': 'off',
                '@typescript-eslint/no-loss-of-precision': 'off',
                '@typescript-eslint/method-signature-style': 'off'
            }
        }
    ]
}
