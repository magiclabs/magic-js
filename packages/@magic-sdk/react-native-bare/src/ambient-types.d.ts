declare namespace NodeJS {
  export interface Global {
    btoa(data: string): string;
    atob(data: string): string;
  }

  export interface Process {
    browser: boolean;
    [key: string]: any;
  }
}

declare module 'react-native-device-info' {
  export function getBundleId(): string;
}
