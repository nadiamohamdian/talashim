import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@/common/dto/http-error.dto';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import type { ApiEnv } from '@/config/env';
import { AuthSessionResponseDto } from '@/modules/auth/dto/auth-session-response.dto';
import {
  SWAGGER_JWT_SCHEME,
  SWAGGER_TAG_DEFINITIONS,
  SWAGGER_TAG_GROUPS,
} from './swagger.constants';

export function isSwaggerEnabled(env: ApiEnv): boolean {
  const flag = process.env.SWAGGER_ENABLED;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return env.NODE_ENV !== 'production';
}

function buildDocumentBuilder(env: ApiEnv) {
  const builder = new DocumentBuilder()
    .setTitle('Talashim API')
    .setDescription(
      [
        'Enterprise REST API for Talashim — e-commerce, wallets, live pricing, and trading.',
        '',
        `**Version:** \`${env.API_VERSION}\` · **Prefix:** \`/${env.API_PREFIX}\``,
        '',
        'Authenticate with **Authorize** using a JWT from `POST /auth/login`.',
        'Admin endpoints require role `ADMIN`.',
      ].join('\n'),
    )
    .setVersion(env.API_VERSION)
    .setContact('Talashim Platform', 'https://talashim.com', 'api@talashim.local')
    .setLicense('Proprietary', '')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Paste the access token from POST /auth/login',
        in: 'header',
      },
      SWAGGER_JWT_SCHEME,
    );

  for (const tag of SWAGGER_TAG_DEFINITIONS) {
    builder.addTag(tag.name, tag.description);
  }

  const localServer = `http://localhost:${env.API_PORT}`;
  builder
    .addServer(
      `${localServer}/${env.API_PREFIX}/${env.API_VERSION}`,
      `Local ${env.API_VERSION}`,
    )
    .addServer(`${localServer}/${env.API_PREFIX}`, `Local (versioned routes)`);

  if (env.NODE_ENV === 'production' && process.env.SWAGGER_ENABLED === 'true') {
    builder.addServer(`/${env.API_PREFIX}/${env.API_VERSION}`, 'Production');
  }

  return builder;
}

function applyTagGroups(document: OpenAPIObject): OpenAPIObject {
  const extended = document as OpenAPIObject & {
    'x-tagGroups'?: Array<{ name: string; tags: string[] }>;
  };
  extended['x-tagGroups'] = SWAGGER_TAG_GROUPS;
  return extended;
}

export function setupSwagger(app: INestApplication, env: ApiEnv): void {
  if (!isSwaggerEnabled(env)) {
    return;
  }

  const swaggerPath = process.env.SWAGGER_PATH ?? 'docs';
  const config = buildDocumentBuilder(env).build();

  const document = applyTagGroups(
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey, methodKey) =>
        `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
      extraModels: [
        ApiErrorResponseDto,
        PaginationMetaDto,
        AuthSessionResponseDto,
      ],
      deepScanRoutes: true,
    }),
  );

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Talashim API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      tryItOutEnabled: true,
    },
    jsonDocumentUrl: `${swaggerPath}-json`,
  });
}
