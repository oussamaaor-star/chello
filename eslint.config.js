import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Sans ce plugin, les usages JSX (<motion.div>, <Icon/>) ne comptent pas
      // comme références → faux positifs no-unused-vars sur les imports.
      'react/jsx-uses-vars': 'error',
    },
  },
  // Code serveur (fonctions Vercel) et scripts de build : environnement Node,
  // pas navigateur (process, Buffer, __dirname…).
  {
    files: ['api/**/*.js', 'scripts/**/*.{js,mjs}', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
