import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { loadConfiguration } from './config/load-configuration.js';
import { setupSwagger } from './config/swagger.js';

async function bootstrap() {
  // Configuração (Azure Key Vault) carregada antes de os módulos serem avaliados.
  await loadConfiguration();
  const { AppModule } = await import('./app.module.js');

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
