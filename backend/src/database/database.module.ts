import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../modules/agents/entities/agent.entity.js';
import { ChatSession } from '../modules/chat/entities/chat-session.entity.js';
import { Company } from '../modules/companies/entities/company.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'botok'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Agent, Company, User, ChatSession]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
