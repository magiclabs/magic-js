import { Extension } from '@magic-sdk/react-native-bare';
import { NativeModules } from 'react-native';

const { RNReactNativeBareAppAttestation } = NativeModules;

export class AppAttestationExtension extends Extension.Internal<'appAttestation'> {
  name = 'appAttestation' as const;
  config: any = {};
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': '>=22.0.0',
    '@magic-sdk/react-native-expo': false,
    '@magic-sdk/react-native': false,
  };

  public attestCall() {
    console.log('******* ATTEST CALLED IN SDK ***********');
    RNReactNativeBareAppAttestation.attest();
  }
}
