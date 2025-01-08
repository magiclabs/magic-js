const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/* istanbul ignore next  */
function fromByteArray(uint8) {
  let i;
  const extraBytes = uint8.length % 3; // if we have 1 byte left, pad 2 bytes
  let output = '';
  let temp;
  let length;

  function encode(num) {
    return lookup.charAt(num);
  }

  function tripletToBase64(num) {
    return encode((num >> 18) & 0x3f) + encode((num >> 12) & 0x3f) + encode((num >> 6) & 0x3f) + encode(num & 0x3f);
  }

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output += tripletToBase64(temp);
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
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

/* istanbul ignore next  */
function b64enc(buf) {
  return fromByteArray(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/* istanbul ignore next  */
function b64RawEnc(buf) {
  return fromByteArray(buf).replace(/\+/g, '-').replace(/\//g, '_');
}

/* istanbul ignore next  */
function hexEncode(buf) {
  return Array.from(buf)
    .map(function (x) {
      return `0${x.toString(16)}`.substr(-2);
    })
    .join('');
}

/**
 * Transforms the binary data in the credential into base64 strings
 * for posting to the server.
 * @param {PublicKeyCredential} newAssertion
 */
/* istanbul ignore next  */
export const transformNewAssertionForServer = newAssertion => {
  const attObj = new Uint8Array(newAssertion.response.attestationObject);
  const clientDataJSON = new Uint8Array(newAssertion.response.clientDataJSON);
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
};

/**
 * Encodes the binary data in the assertion into strings for posting to the server.
 * @param {PublicKeyCredential} newAssertion
 */
/* istanbul ignore next  */
export const transformAssertionForServer = newAssertion => {
  const authData = new Uint8Array(newAssertion.response.authenticatorData);
  const clientDataJSON = new Uint8Array(newAssertion.response.clientDataJSON);
  const rawId = new Uint8Array(newAssertion.rawId);
  const sig = new Uint8Array(newAssertion.response.signature);
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
};
