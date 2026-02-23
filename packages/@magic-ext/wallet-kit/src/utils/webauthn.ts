// ==========================================
// WebAuthn Utility Functions
// ==========================================

const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function fromByteArray(uint8: Uint8Array): string {
  let i;
  const extraBytes = uint8.length % 3;
  let output = '';
  let temp;
  let length;

  function encode(num: number): string {
    return lookup.charAt(num);
  }

  function tripletToBase64(num: number): string {
    return encode((num >> 18) & 0x3f) + encode((num >> 12) & 0x3f) + encode((num >> 6) & 0x3f) + encode(num & 0x3f);
  }

  for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output += tripletToBase64(temp);
  }

  switch (extraBytes) {
    case 1:
      temp = uint8[uint8.length - 1];
      output += encode(temp >> 2);
      output += encode((temp << 4) & 0x3f);
      output += '==';
      break;
    case 2:
      temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
      output += encode(temp >> 10);
      output += encode((temp >> 4) & 0x3f);
      output += encode((temp << 2) & 0x3f);
      output += '=';
      break;
    default:
      break;
  }

  return output;
}

function b64enc(buf: Uint8Array): string {
  return fromByteArray(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64RawEnc(buf: Uint8Array): string {
  return fromByteArray(buf).replace(/\+/g, '-').replace(/\//g, '_');
}

function hexEncode(buf: Uint8Array): string {
  return Array.from(buf)
    .map(function (x) {
      return `0${x.toString(16)}`.substr(-2);
    })
    .join('');
}

/**
 * Transforms the binary data in the credential into base64 strings
 * for posting to the server.
 */
export function transformNewAssertionForServer(newAssertion: PublicKeyCredential) {
  const response = newAssertion.response as AuthenticatorAttestationResponse;
  const attObj = new Uint8Array(response.attestationObject);
  const clientDataJSON = new Uint8Array(response.clientDataJSON);
  const rawId = new Uint8Array(newAssertion.rawId);

  const registrationClientExtensions = newAssertion.getClientExtensionResults();

  return {
    id: newAssertion.id,
    rawId: b64enc(rawId),
    type: newAssertion.type,
    attObj: b64enc(attObj),
    clientData: b64enc(clientDataJSON),
    registrationClientExtensions: JSON.stringify(registrationClientExtensions),
  };
}

/**
 * Encodes the binary data in the assertion into strings for posting to the server.
 */
export function transformAssertionForServer(newAssertion: PublicKeyCredential) {
  const response = newAssertion.response as AuthenticatorAssertionResponse;
  const authData = new Uint8Array(response.authenticatorData);
  const clientDataJSON = new Uint8Array(response.clientDataJSON);
  const rawId = new Uint8Array(newAssertion.rawId);
  const sig = new Uint8Array(response.signature);
  const assertionClientExtensions = newAssertion.getClientExtensionResults();

  return {
    id: newAssertion.id,
    rawId: b64enc(rawId),
    type: newAssertion.type,
    authData: b64RawEnc(authData),
    clientData: b64RawEnc(clientDataJSON),
    signature: hexEncode(sig),
    assertionClientExtensions: JSON.stringify(assertionClientExtensions),
  };
}

export enum WebAuthnPayloadMethod {
  WebAuthnRegistrationStart = 'magic_auth_webauthn_registration_start',
  RegisterWithWebAuth = 'magic_auth_webauthn_register',
  LoginWithWebAuthn = 'magic_auth_login_with_web_authn',
  WebAuthnLoginVerify = 'magic_auth_login_with_webauthn_verify',
  GetWebAuthnInfo = 'magic_user_get_webauthn_credentials',
  UpdateWebAuthnInfo = 'magic_user_update_webauthn',
  UnregisterWebAuthDevice = 'magic_user_unregister_webauthn',
  RegisterWebAuthDeviceStart = 'magic_auth_register_webauthn_device_start',
  RegisterWebAuthDevice = 'magic_auth_register_webauthn_device',
}

export enum WebAuthnSDKErrorCode {
  WebAuthnNotSupported = 'WEBAUTHN_NOT_SUPPORTED',
  WebAuthnCreateCredentialError = 'WEBAUTHN_CREATE_CREDENTIAL_ERROR',
}
