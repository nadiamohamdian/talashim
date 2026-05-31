import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WorkerService } from './worker.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(WorkerService).start();
}

bootstrap().catch((err) => {
  console.error('Worker failed to start', err);
  process.exit(1);
});
