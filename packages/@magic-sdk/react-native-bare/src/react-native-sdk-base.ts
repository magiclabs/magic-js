import { createPromiEvent, MagicSDKAdditionalConfiguration, SDKBase, UserModule } from '@magic-sdk/provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNativeWebViewController } from './react-native-webview-controller';

type UserLoggedOutCallback = (loggedOut: boolean) => void;

export class SDKBaseReactNative extends SDKBase {
  // this UserModule instance used for the actual calls to
  // `isLoggedIn` and `logOut`, given that we assign new functions
  // to `this.user.isLoggedIn` and `this.user.logOut`.
  private usr: UserModule;
  private userLoggedOutCallbacks: UserLoggedOutCallback[] = [];

  constructor(public readonly apiKey: string, options?: MagicSDKAdditionalConfiguration) {
    super(apiKey, options);
    this.usr = new UserModule(this);
    if (options?.useStorageCacheMobile) {
      this.user.isLoggedIn = () => {
        return createPromiEvent<boolean, any>(async (resolve, reject) => {
          const cachedIsLoggedIn = (await AsyncStorage.getItem('isLoggedIn')) === 'true';

          // if isLoggedIn is true on storage, optimistically resolve with true
          // if it is false, we use `usr.isLoggedIn` as the source of truth.
          if (cachedIsLoggedIn) {
            resolve(true);
          }

          this.usr.isLoggedIn().then(async (isLoggedIn: boolean) => {
            if (isLoggedIn === false) {
              AsyncStorage.removeItem('isLoggedIn');
              if (cachedIsLoggedIn) {
                this.emitUserLoggedOut(true);
              }
            } else {
              AsyncStorage.setItem('isLoggedIn', 'true');
            }
            resolve(isLoggedIn);
          });
        });
      };

      this.user.logout = () => {
        return createPromiEvent<boolean, any>(async (resolve, reject) => {
          let response = false;
          try {
            response = await this.usr.logout();
            await AsyncStorage.removeItem('isLoggedIn');
            this.emitUserLoggedOut(response);
            resolve(response);
          } catch (e) {
            reject(e);
          }
        });
      };
    }
  }

  private emitUserLoggedOut(loggedOut: boolean): void {
    this.userLoggedOutCallbacks.forEach((callback) => {
      callback(loggedOut);
    });
  }

  public onUserLoggedOut(callback: UserLoggedOutCallback): void {
    this.userLoggedOutCallbacks.push(callback);
  }

  public get Relayer() {
    return (this.overlay as ReactNativeWebViewController).Relayer;
  }
}
