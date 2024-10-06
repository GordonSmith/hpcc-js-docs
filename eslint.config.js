import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { readGitignoreFiles } from "eslint-gitignore";

export default tseslint.config(
    { ignores: [...readGitignoreFiles()] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
        },
        rules: {
            quotes: ['warn', 'double', { "avoidEscape": true }],
            semi: ["warn"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "all",
                    "argsIgnorePattern": "_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "_",
                    "destructuredArrayIgnorePattern": "_",
                    "varsIgnorePattern": "_",
                    "ignoreRestSiblings": true
                }
            ],
            "@typescript-eslint/no-explicit-any": "off"
        },
    },
)
