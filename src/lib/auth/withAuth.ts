import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, AuthUser } from './index'

type AuthenticatedHandler<T = void> = T extends void
  ? (request: NextRequest, user: AuthUser) => Promise<NextResponse> | NextResponse
  : (request: NextRequest, user: AuthUser, context: T) => Promise<NextResponse> | NextResponse

export function withAuth<T = void>(handler: AuthenticatedHandler<T>) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const { user, error } = await getAuthenticatedUser(request)

    if (!user || error) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (context !== undefined) {
      return (handler as AuthenticatedHandler<T>)(request, user, context)
    }
    return (handler as AuthenticatedHandler<void>)(request, user)
  }
}
