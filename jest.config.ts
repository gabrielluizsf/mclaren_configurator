import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  
  testEnvironment: 'jest-environment-jsdom',
  
  clearMocks: true,
  
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', 
  },

  transformIgnorePatterns: [
    "node_modules/(?!(three)/)"
  ],
};

export default config;