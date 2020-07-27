module.exports = {
  cache: false,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx,vue}'
  ],
  testMatch: [
    '**/tests/**/*.spec.ts'
  ]
};
