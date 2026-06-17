import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { and, desc, eq, ne } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import { db } from '../db'
import { offers, subscriptions, users } from '../db/schema'
import type { JwtPayload } from '../common/types/shared'
import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, dto.email)).limit(1)
    if (existing.length > 0) throw new ConflictException('Email déjà utilisé')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const [user] = await db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        profile: (dto.profile as typeof users.$inferInsert['profile']) ?? null,
        language: dto.language ?? 'fr',
      })
      .returning()

    return this.buildTokens(user)
  }

  async login(dto: LoginDto) {
    const [user] = await db.select().from(users).where(eq(users.email, dto.email)).limit(1)
    if (!user) throw new UnauthorizedException('Identifiants invalides')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Identifiants invalides')

    return this.buildTokens(user)
  }

  async getMe(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profile: users.profile,
        role: users.role,
        language: users.language,
        gdprConsent: users.gdprConsent,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) throw new UnauthorizedException()

    const [subscription] = await db
      .select({
        id: subscriptions.id,
        offerId: subscriptions.offerId,
        offerName: offers.name,
        monthlyPrice: offers.monthlyPrice,
        yearlyPrice: offers.yearlyPrice,
        status: subscriptions.status,
        fraudScore: subscriptions.fraudScore,
        fraudLevel: subscriptions.fraudLevel,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
      })
      .from(subscriptions)
      .leftJoin(offers, eq(subscriptions.offerId, offers.id))
      .where(and(eq(subscriptions.payerId, userId), ne(subscriptions.status, 'cancelled')))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1)

    return { ...user, subscription: subscription ?? null }
  }

  refresh(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role }
    return { access_token: this.jwtService.sign(payload) }
  }

  private buildTokens(user: typeof users.$inferSelect) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role }
    const access_token = this.jwtService.sign(payload)
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? this.configService.get<string>('JWT_SECRET') ?? 'changeme',
      expiresIn: '7d',
    })
    return { access_token, refresh_token }
  }
}
