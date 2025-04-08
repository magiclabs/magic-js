import baseJestConfig from '../../../jest.config';
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  ...baseJestConfig,
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((react-native|@magic-sdk/provider|@magic-sdk/react-native.*|react-navigation|@react-native|react-native-gesture-handler|react-native-event-listeners)/).*)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;
