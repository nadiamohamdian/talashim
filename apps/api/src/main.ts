import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { getApiEnv } from './config/env';

async function bootstrap() {
  const env = getApiEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [env.CORS_ORIGIN],
    credentials: true,
  });
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix(env.API_PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: env.API_VERSION,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sadaf Gold API')
      .setDescription('Modular NestJS API for the gold e-commerce platform.')
      .setVersion(env.API_VERSION)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(env.API_PORT);
}
void bootstrap();
