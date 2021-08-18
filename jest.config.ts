import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  maxWorkers: 2,
  preset: 'ts-jest',
  coverageReporters: ['text-summary', 'html'],
  collectCoverageFrom: ['./src/**/*.{ts,tsx,}'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 99,
      statements: 99,
      functions: 99,
      branches: 99,
    }
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './test/tsconfig.json',
      isolatedModules: true,
    },
  },
};

export default config;
