/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['<rootDir>/.jest/setEnvVars.ts'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(\\.|/)(integration-test|integration-spec)\\.[jt]sx?$',
  testTimeout: 10000,
};
