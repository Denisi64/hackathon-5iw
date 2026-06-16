import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import type { JwtPayload } from '../common/types/shared'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    // In production, verify the refresh token signature here
    // For hackathon: decode without verification to extract payload
    const decoded = JSON.parse(Buffer.from(dto.refresh_token.split('.')[1], 'base64').toString()) as JwtPayload
    return this.authService.refresh(decoded.sub, decoded.email, decoded.role)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return { message: 'Déconnecté' }
  }
}
