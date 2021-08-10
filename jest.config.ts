import type { Config } from '@jest/types';
import { compilerOptions } from './tsconfig.settings.json';

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
      tsconfig: { ...compilerOptions, jsx: 'react' },
      isolatedModules: true,
    },
  },
};

export default config;
