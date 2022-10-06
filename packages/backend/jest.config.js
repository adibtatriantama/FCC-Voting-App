/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    },
  },
  testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
  setupFiles: [
    '<rootDir>/.jest/setupTsAutoMock.ts',
    '<rootDir>/.jest/setEnvVars.ts',
  ],
};
