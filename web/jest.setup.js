import '@testing-library/jest-dom'

// Mock next/head
jest.mock('next/head', () => {
  return function Head(props) {
    return props.children
  }
})

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'))

// Setup global test environment
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}