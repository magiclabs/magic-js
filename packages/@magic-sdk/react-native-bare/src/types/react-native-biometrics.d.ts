declare module '@sbaiahmed1/react-native-biometrics' {
  export enum BiometricStrength {
    Weak = 'WEAK',
    Strong = 'STRONG',
  }

  export function configureKeyAlias(keyAlias: string): Promise<void>;
  export function getDefaultKeyAlias(): Promise<string>;
  export function getKeyAttributes(
    keyAlias?: string,
  ): Promise<{ exists: boolean; attributes?: object; error?: string }>;
  export function createKeys(
    keyAlias?: string,
    keyType?: 'rsa2048' | 'ec256',
    biometricStrength?: BiometricStrength,
  ): Promise<{ publicKey: string }>;
  export function getAllKeys(customAlias?: string): Promise<{ keys: Array<{ alias: string; publicKey: string }> }>;
  export function deleteKeys(keyAlias?: string): Promise<{ success: boolean }>;
  export function verifyKeySignature(
    keyAlias: string | undefined,
    data: string,
    promptTitle?: string,
    promptSubtitle?: string,
    cancelButtonText?: string,
  ): Promise<{ success: boolean; signature?: string; error?: string }>;
}
