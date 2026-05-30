import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Worker runs as background context; real queue/cron setup goes here.
  const worker = app.get('WorkerService');
  if (worker && typeof worker.start === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    worker.start();
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker failed to start', err);
  process.exit(1);
});
