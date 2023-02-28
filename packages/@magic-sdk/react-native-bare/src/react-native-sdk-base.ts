import { SDKBase } from '@magic-sdk/provider';
import { ReactNativeWebViewController } from './react-native-webview-controller';

export class SDKBaseReactNative extends SDKBase {
  public get Relayer() {
    return (this.overlay as ReactNativeWebViewController).Relayer;
  }
}
