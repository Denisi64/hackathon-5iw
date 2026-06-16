import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { JwtPayload } from '../../types/domain'

const MOCK_TOKEN = 'mock-token-devA'

const MOCK_USER: JwtPayload = {
  sub: 'user-dev-a',
  email: 'dev-a@comutitres.local',
  role: 'payer',
}

@Injectable()
export class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()

    if (request.headers.authorization !== `Bearer ${MOCK_TOKEN}`) {
      throw new UnauthorizedException('Invalid or missing authentication token')
    }

    request.user = MOCK_USER
    return true
  }
}
