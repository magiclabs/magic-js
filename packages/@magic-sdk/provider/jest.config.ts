import baseJestConfig from '../../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseJestConfig,
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['third-party-wallets.ts', 'nft.ts', 'wallet.ts'],
};

export default config;
