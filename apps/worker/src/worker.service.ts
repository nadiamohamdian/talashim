import { Injectable, Logger } from '@nestjs/common';
import { getWorkerEnv } from './config/env';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  start() {
    const env = getWorkerEnv();
    this.logger.log(`Worker ${env.WORKER_NAME} started (concurrency: ${env.WORKER_CONCURRENCY}).`);
  }
}
