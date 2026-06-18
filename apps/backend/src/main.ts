import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true, bufferLogs: true })
  const configService = app.get(ConfigService)
  const frontendUrl = configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: true,
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const port = configService.get<number>('PORT') ?? 3000
  await app.listen(port, '0.0.0.0')
}

void bootstrap()
