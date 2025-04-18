import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  maxWorkers: 2,
  preset: 'ts-jest',
  coverageReporters: ['text-summary', 'html'],
  collectCoverageFrom: ['./src/**/*.{ts,tsx,}'],
  collectCoverage: true,
  testTimeout: 30000, // 30s
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      lines: 99,
      statements: 99,
      functions: 98,
      branches: 99,
    },
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: './test/tsconfig.json',
      },
    ],
  },
};

export default config;
