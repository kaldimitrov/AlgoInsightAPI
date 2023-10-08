export interface TokenPayload {
  firstName: string;
  lastName: string;
  userId: number;
  payload: string;
}

export interface DecodedToken extends TokenPayload {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  iat?: number; // Issued At (timestamp)
  exp?: number; // Expiration Time (timestamp)
  nbf?: number; // Not Before (timestamp)
  jti?: string; // JWT ID
}
