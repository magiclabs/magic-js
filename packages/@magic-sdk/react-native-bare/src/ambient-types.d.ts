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

declare module '@aveq-research/localforage-asyncstorage-driver' {
  export const driverWithoutSerialization: any;
}

declare module 'react-native-device-info' {
  export function getBundleId(): string;
}
