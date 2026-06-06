import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'Talashim API',
      status: 'ready',
      version: 'v1',
    };
  }
}
