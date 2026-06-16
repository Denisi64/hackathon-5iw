import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { MockJwtAuthGuard } from './mock-jwt-auth.guard'

function createContext(authHeader?: string): ExecutionContext {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: { authorization: authHeader },
  }
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext
}

describe('MockJwtAuthGuard', () => {
  it('allows requests with the mock bearer token and attaches the user', () => {
    const guard = new MockJwtAuthGuard()
    const context = createContext('Bearer mock-token-devA')

    expect(guard.canActivate(context)).toBe(true)
    expect(context.switchToHttp().getRequest().user).toEqual({
      sub: 'user-dev-a',
      email: 'dev-a@comutitres.local',
      role: 'payeur',
    })
  })

  it('rejects requests without the mock bearer token', () => {
    const guard = new MockJwtAuthGuard()
    const context = createContext('Bearer wrong-token')

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('rejects requests with no authorization header', () => {
    const guard = new MockJwtAuthGuard()
    const context = createContext(undefined)

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })
})
