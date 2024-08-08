import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json', // Use tsconfig.app.json for tests
      },
    ],
  },
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/config/jest/fileMock.ts',
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/config/jest/styleMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTests.ts'],
  moduleFileExtensions: ['tsx', 'ts', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.app.json',
    },
  },
};

export default config;
