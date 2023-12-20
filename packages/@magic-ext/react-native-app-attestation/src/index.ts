import { Extension } from '@magic-sdk/commons';
import { NativeModules } from 'react-native';

const { RNAppAttestation } = NativeModules;

export class AppAttestationExtension extends Extension.Internal<'appAttestation'> {
  name = 'appAttestation' as const;
  config: any = {};
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': '>=22.0.0',
    '@magic-sdk/react-native-expo': false,
    '@magic-sdk/react-native': false,
  };

  public async verifyApp(): Promise<boolean> {
    try {
      const attestationCheckStatus = await RNAppAttestation.attest();

      return attestationCheckStatus;
    } catch (error) {
      // Log in case of an error
      console.error(`Error during App Attestation check: ${(error as Error).message}`);
      return false;
    }
  }
}
