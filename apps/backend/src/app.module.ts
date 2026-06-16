import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ExternalModule } from './external/external.module'
import { HoldersModule } from './holders/holders.module'
import { NotificationsModule } from './notifications/notifications.module'
import { UsersModule } from './users/users.module'
import { OffersModule } from './offers/offers.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'
import { DocumentsModule } from './documents/documents.module'
import { AiModule } from './ai/ai.module'
import { PaymentsModule } from './payments/payments.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    HoldersModule,
    NotificationsModule,
    ExternalModule,
    OffersModule,
    SubscriptionsModule,
    DocumentsModule,
    AiModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
