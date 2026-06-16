import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { eq } from 'drizzle-orm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { db } from '../../db'
import { users } from '../../db/schema'
import type { JwtPayload } from '../../common/types/shared'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'changeme',
    })
  }

  async validate(payload: JwtPayload) {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, payload.sub)).limit(1)
    if (!user) throw new UnauthorizedException()
    return payload
  }
}
