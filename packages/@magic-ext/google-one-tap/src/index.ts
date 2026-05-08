import { Extension } from '@magic-sdk/provider';
import { loadGsi } from './gsi-loader';
import type { GoogleCredentialResponse } from './google-types';
import { GoogleOneTapConfig, GoogleOneTapPayloadMethod, LoginWithGoogleOneTapParams } from './types';

export class GoogleOneTapExtension extends Extension.Internal<'googleOneTap', GoogleOneTapConfig> {
  name = 'googleOneTap' as const;
  config: GoogleOneTapConfig;
  compat = {
    'magic-sdk': true,
    '@magic-sdk/react-native': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': false,
  };

  constructor(config: GoogleOneTapConfig) {
    super();
    this.config = config;
  }

  /**
   * Display the Google One Tap prompt. Resolves with the Magic DID token (or
   * public address, depending on the SDK config) once the user picks an account
   * and the credential is verified server-side.
   *
   * Throws if GSI fails to load, the user dismisses the prompt without selecting,
   * or the iframe verify call rejects.
   */
  public show(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      loadGsi()
        .then(accountsId => {
          accountsId.initialize({
            client_id: this.config.googleClientId,
            auto_select: this.config.autoSelect ?? false,
            cancel_on_tap_outside: this.config.cancelOnTapOutside ?? true,
            use_fedcm_for_prompt: this.config.useFedCM ?? true,
            prompt_parent_id: this.config.promptParentId,
            callback: (response: GoogleCredentialResponse) => {
              if (!response?.credential) {
                reject(new Error('Google One Tap returned no credential.'));
                return;
              }

              const params: LoginWithGoogleOneTapParams = {
                jwt: response.credential,
                providerId: this.config.magicProviderId,
                lifespan: this.config.lifespan,
              };

              const payload = this.utils.createJsonRpcRequestPayload(
                GoogleOneTapPayloadMethod.LoginWithGoogleOneTap,
                [params],
              );

              this.request<string>(payload).then(resolve, reject);
            },
          });

          accountsId.prompt(notification => {
            // Surface a hard error if the prompt was suppressed entirely (browser
            // doesn't trust the origin, FedCM blocked, cooldown active, etc.).
            // Skipped/dismissed moments are user-initiated and intentionally don't
            // reject — the dapp can call show() again or fall back to another login.
            if (notification.isNotDisplayed()) {
              reject(new Error(`Google One Tap not displayed: ${notification.getNotDisplayedReason()}`));
            }
          });
        })
        .catch(reject);
    });
  }

  /**
   * Programmatically dismiss the One Tap prompt if it's open. No-op if GSI
   * has not loaded yet.
   */
  public cancel(): void {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  /**
   * Disable Google's automatic re-sign-in for this user. Call this from your
   * sign-out flow so the next page load doesn't immediately re-prompt with
   * `auto_select` and silently re-authenticate.
   */
  public disableAutoSelect(): void {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export * from './types';
