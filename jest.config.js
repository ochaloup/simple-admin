/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  testTimeout: 120000,
  testPathIgnorePatterns: ['__tests__/.*utils.ts', '__tests__/.*.skip.ts'],
  detectOpenHandles: true,
}
