import { ValidationPipe, type INestApplication, VersioningType } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { ApiEnv } from '@sadafgold/shared/api-env';
import { buildCorsOptions, buildHelmetOptions } from '@/config/security.config';

export function configureApp(app: INestApplication, env: ApiEnv): void {
  const httpServer = app.getHttpAdapter().getInstance();

  if (env.TRUST_PROXY) {
    httpServer.set('trust proxy', 1);
  }

  httpServer.disable('x-powered-by');

  app.use(helmet(buildHelmetOptions(env)));

  if (env.COMPRESSION_ENABLED) {
    app.use(
      compression({
        threshold: 1024,
        level: 6,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
      }),
    );
  }

  app.enableCors(buildCorsOptions(env));
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
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  app.enableShutdownHooks();
}
