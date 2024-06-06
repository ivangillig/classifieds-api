import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import { fixupConfigRules } from '@eslint/compat';

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  pluginJs.configs.recommended,
  ...fixupConfigRules(pluginReact.configs.recommended),
];
