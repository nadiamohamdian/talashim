import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'Sadaf Gold API',
      status: 'ready',
      version: 'v1',
    };
  }
}
