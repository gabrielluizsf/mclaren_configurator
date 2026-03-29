import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  
  testEnvironment: 'jest-environment-jsdom',
  
  clearMocks: true,
  
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', 
  },
  
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', 
  },

  transformIgnorePatterns: [
    "node_modules/(?!(three)/)"
  ],
};

export default config;