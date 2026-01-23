import baseJestConfig from '../../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseJestConfig,
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['index.cdn.ts', 'index.native.ts'],
  moduleNameMapper: {
    '^@aptos-labs/wallet-adapter-core$': '<rootDir>/test/__mocks__/@aptos-labs/wallet-adapter-core.ts',
    '^@aptos-labs/wallet-standard$': '<rootDir>/test/__mocks__/@aptos-labs/wallet-standard.ts',
  },
};

export default config;
