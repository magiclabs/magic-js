import baseJestConfig from '../../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseJestConfig,
  preset: '@testing-library/react-native',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    '\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(" +
    "(jest-)?react-native" +
    "|react-clone-referenced-element" +
    "|@react-native-community" +
    "|@react-native" +
    "|expo(nent)?" +
    "|@expo(nent)?/.*" +
    "|react-navigation" +
    "|@react-navigation/.*" +
    "|@unimodules/.*" +
    "|unimodules" +
    "|sentry-expo" +
    "|native-base" +
    "|@sentry/.*" +
    "|native-base-*))"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};

export default config;
