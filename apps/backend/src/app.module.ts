import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DocumentsModule } from './documents/documents.module'
import { AuthModule } from './auth/auth.module'
import { ExternalModule } from './external/external.module'
import { HoldersModule } from './holders/holders.module'
import { NotificationsModule } from './notifications/notifications.module'
import { UsersModule } from './users/users.module'
import { OffersModule } from './offers/offers.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    HoldersModule,
    NotificationsModule,
    ExternalModule,
    OffersModule,
    SubscriptionsModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
