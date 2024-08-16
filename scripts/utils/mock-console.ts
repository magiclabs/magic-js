export function mockConsole() {
  // Mock console.warn
  Object.defineProperty(console, 'warn', {
    value: jest.fn(),
  });

  // Mock console.info
  Object.defineProperty(console, 'info', {
    value: jest.fn(),
  });

  // Mock console.error
  Object.defineProperty(console, 'error', {
    value: jest.fn(),
  });
}
