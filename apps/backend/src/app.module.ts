import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ExternalModule } from './external/external.module'
import { HoldersModule } from './holders/holders.module'
import { NotificationsModule } from './notifications/notifications.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    HoldersModule,
    NotificationsModule,
    ExternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
