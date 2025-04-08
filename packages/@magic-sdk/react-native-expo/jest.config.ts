import baseJestConfig from '../../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseJestConfig,
  preset: 'jest-expo',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|expo-.*)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // testEnvironment: 'node',
  // testEnvironmentOptions: {
  //   url: 'http://localhost',
  // },
};

export default config;
