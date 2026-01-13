export interface DpopHeader {
  typ: 'dpop+jwt';
  alg: 'ES256';
  jwk: JsonWebKey;
}

export interface DpopClaims {
  iat: number;
  jti: string;
  htm?: string;
  htu?: string;
}

export interface JsonWebKey {
  kty: string;
  crv: string;
  x: string;
  y: string;
  ext?: boolean;
}
