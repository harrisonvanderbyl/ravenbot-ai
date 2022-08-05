module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      configFile: './.babelrc',
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
  },
};
