import JestConfig from '../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...JestConfig,

  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      functions: 55,
      branches: 70,
    },
  },
};
export default config;
