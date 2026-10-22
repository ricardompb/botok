import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
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
