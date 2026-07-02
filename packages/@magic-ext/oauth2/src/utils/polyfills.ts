import { Base64URL } from './base64';

function isAuthenticatorAssertionResponse(value: AuthenticatorResponse): value is AuthenticatorAssertionResponse {
  if (typeof value !== 'object') return false;
  if (
    (value as AuthenticatorAssertionResponse)?.authenticatorData === undefined ||
    typeof (value as AuthenticatorAssertionResponse)?.authenticatorData !== 'object'
  ) {
    return false;
  }
  return true;
}

function isAuthenticatorAttestationResponse(value: AuthenticatorResponse): value is AuthenticatorAttestationResponse {
  if (typeof value !== 'object') return false;
  if (
    (value as AuthenticatorAttestationResponse)?.attestationObject === undefined ||
    typeof (value as AuthenticatorAttestationResponse)?.attestationObject !== 'object'
  ) {
    return false;
  }
  return true;
}

/**
 * Polyfill `PublicKeyCredential.prototype.toJSON`
 *
 * See https://w3c.github.io/webauthn/#dom-publickeycredential-tojson
 */
export function toJSON(cred: PublicKeyCredential): PublicKeyCredentialJSON {
  if (typeof cred.toJSON === 'function') {
    return cred.toJSON();
  }

  try {
    const id = cred.id;
    const rawId = Base64URL.encode(cred.rawId);
    const authenticatorAttachment = cred.authenticatorAttachment;
    const clientExtensionResults = {};
    const type = cred.type;

    if (isAuthenticatorAssertionResponse(cred.response)) {
      return {
        id,
        rawId,
        response: {
          authenticatorData: Base64URL.encode(cred.response.authenticatorData),
          clientDataJSON: Base64URL.encode(cred.response.clientDataJSON),
          signature: Base64URL.encode(cred.response.signature),
          userHandle: cred.response.userHandle ? Base64URL.encode(cred.response.userHandle) : undefined,
        },
        authenticatorAttachment,
        clientExtensionResults,
        type,
      };
    }

    if (isAuthenticatorAttestationResponse(cred.response)) {
      return {
        id,
        rawId,
        response: {
          clientDataJSON: Base64URL.encode(cred.response.clientDataJSON),
          attestationObject: Base64URL.encode(cred.response.attestationObject),
          transports: cred.response?.getTransports() || [],
        },
        authenticatorAttachment,
        clientExtensionResults,
        type,
      };
    }

    throw new Error('Unexpected object.');
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Polyfill `PublicKeyCredential.parseRequestOptionsFromJSON`
 *
 * See https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON
 */
export function parseRequestOptionsFromJSON(
  options: PublicKeyCredentialRequestOptionsJSON,
): PublicKeyCredentialRequestOptions {
  if (
    typeof PublicKeyCredential !== 'undefined' &&
    typeof PublicKeyCredential.parseRequestOptionsFromJSON === 'function'
  ) {
    return PublicKeyCredential.parseRequestOptionsFromJSON(options);
  }

  const challenge = Base64URL.decode(options.challenge) as ArrayBuffer;
  const allowCredentials =
    options.allowCredentials?.map(cred => ({
      ...cred,
      id: Base64URL.decode(cred.id) as ArrayBuffer,
      transports: cred.transports as AuthenticatorTransport[] | undefined,
    })) ?? [];

  return {
    ...options,
    allowCredentials,
    challenge,
  } as PublicKeyCredentialRequestOptions;
}
