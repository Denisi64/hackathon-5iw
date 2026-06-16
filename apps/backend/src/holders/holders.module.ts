import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { HoldersController } from './holders.controller'
import { HoldersService } from './holders.service'

@Module({
  imports: [AuthModule],
  controllers: [HoldersController],
  providers: [HoldersService],
  exports: [HoldersService],
})
export class HoldersModule {}
