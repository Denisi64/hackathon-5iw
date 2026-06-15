import { Injectable } from '@nestjs/common'

export type HealthResponse = {
  status: 'ok'
  service: 'comutitres-backend'
  timestamp: string
}

@Injectable()
export class AppService {
  health(): HealthResponse {
    return {
      status: 'ok',
      service: 'comutitres-backend',
      timestamp: new Date().toISOString(),
    }
  }
}
