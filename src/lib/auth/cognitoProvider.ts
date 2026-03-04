import { AuthProvider, AuthUser } from './types'
import { verifyCognitoToken, extractBearerToken } from '@/lib/cognito'

export class CognitoProvider implements AuthProvider {
  async getUser(request: Request): Promise<AuthUser | null> {
    try {
      const authHeader = request.headers.get('Authorization')
      const token = extractBearerToken(authHeader)

      if (!token) {
        return null
      }

      const cognitoUser = await verifyCognitoToken(token)

      return {
        id: cognitoUser.sub,
        email: cognitoUser.email,
        phone: cognitoUser.phone_number,
        username: cognitoUser['cognito:username'],
        provider: 'cognito',
      }
    } catch (error) {
      return null
    }
  }
}
