import { createRemoteJWKSet, jwtVerify } from 'jose'

const COGNITO_REGION = 'us-east-1'
const COGNITO_USER_POOL_ID = 'us-east-1_cgTtku27r'
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
const JWKS_URI = `${COGNITO_ISSUER}/.well-known/jwks.json`

const JWKS = createRemoteJWKSet(new URL(JWKS_URI))

export interface CognitoUser {
  sub: string
  email?: string
  phone_number?: string
  'cognito:username': string
  email_verified?: boolean
  phone_number_verified?: boolean
}

export async function verifyCognitoToken(token: string): Promise<CognitoUser> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: COGNITO_ISSUER,
      audience: undefined,
    })

    return {
      sub: payload.sub || '',
      email: payload.email as string | undefined,
      phone_number: payload.phone_number as string | undefined,
      'cognito:username': payload['cognito:username'] as string,
      email_verified: payload.email_verified as boolean | undefined,
      phone_number_verified: payload.phone_number_verified as boolean | undefined,
    }
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
