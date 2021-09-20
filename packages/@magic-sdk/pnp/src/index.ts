import type { Magic } from 'magic-sdk';

declare global {
  interface Window {
    Magic: typeof Magic;
  }
}

console.log('hello', new window.Magic('api-key'));
