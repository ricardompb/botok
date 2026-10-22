import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenancyModule } from './common/tenancy/tenancy.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AgentsModule } from './modules/agents/agents.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { SupportModule } from './modules/support/support.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    // Variáveis já carregadas em process.env por loadConfiguration (Key Vault ou .env).
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    DatabaseModule,
    TenancyModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    AgentsModule,
    ChatModule,
    SupportModule,
    DashboardModule,
  ],
})
export class AppModule {}
