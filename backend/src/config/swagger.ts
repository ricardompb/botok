import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const BEARER = 'bearer';

/** Desligado em produção, salvo SWAGGER_ENABLED=true. */
export function isSwaggerEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== 'production' || env.SWAGGER_ENABLED === 'true';
}

/** Swagger em /docs (OpenAPI em /docs/json). */
export function setupSwagger(app: INestApplication) {
  if (!isSwaggerEnabled()) return;

  const config = new DocumentBuilder()
    .setTitle('IT’s OK API')
    .setDescription(
      'API da plataforma IT’s OK. Autenticação por access token do Microsoft Entra ID ' +
        '(ou token do login local em desenvolvimento). Os dados de cada empresa são isolados por tenant.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Access token do Entra ID ou do login local.' },
      BEARER,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    customSiteTitle: 'IT’s OK API',
    swaggerOptions: { persistAuthorization: true },
  });
}
