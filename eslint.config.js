// ESLint configuration for BookBuddy project
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// ESLint configuration array for modern flat config
export default [
  // Ignore build output directory
  { ignores: ['dist'] },
  
  // Configuration for JavaScript and JSX files
  {
    files: ['**/*.{js,jsx}'],
    
    // Language options for parsing
    languageOptions: {
      ecmaVersion: 2020, // Support ES2020 features
      globals: globals.browser, // Browser global variables
      parserOptions: {
        ecmaVersion: 'latest', // Use latest ECMAScript version
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: 'module', // Use ES modules
      },
    },
    
    // ESLint plugins for React development
    plugins: {
      'react-hooks': reactHooks, // React Hooks rules
      'react-refresh': reactRefresh, // React Fast Refresh rules
    },
    
    // Linting rules configuration
    rules: {
      ...js.configs.recommended.rules, // Base JavaScript recommended rules
      ...reactHooks.configs.recommended.rules, // React Hooks best practices
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Allow unused constants
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Allow constant exports for React Fast Refresh
      ],
    },
  },
]
