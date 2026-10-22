import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        // Usuário sem SUPERUSER/BYPASSRLS: o Row-Level Security vale para o backend.
        username: config.get('DB_USER', 'botok_app'),
        password: config.get('DB_PASSWORD', 'botok_app'),
        database: config.get('DB_NAME', 'botok'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
