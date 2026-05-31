import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
import { getApiEnv } from './config/env';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap() {
  const env = getApiEnv();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: [env.LOG_LEVEL, 'error', 'warn'],
    bufferLogs: true,
  });

  configureApp(app, env);
  setupSwagger(app, env);

  await app.listen(env.API_PORT);
  logger.log(`API listening on port ${env.API_PORT} (${env.NODE_ENV})`);
}

void bootstrap();
