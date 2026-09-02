import globals from 'globals';

const qualityRules = {
  'no-constant-binary-expression': 'error',
  'no-dupe-else-if': 'error',
  'no-self-assign': 'error',
  'no-unreachable': 'error',
  'no-undef': 'error',
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }]
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'css/tailwind.css']
  },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    rules: qualityRules
  },
  {
    files: ['pwa/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: globals.serviceworker
    },
    rules: qualityRules
  },
  {
    files: ['tests/**/*.js', 'rules-tests/**/*.js', 'vite.config.js', 'eslint.config.js', 'tailwind.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    rules: qualityRules
  }
];
