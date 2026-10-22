import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { CompaniesModule } from '../companies/companies.module.js';
import { UsersModule } from '../users/users.module.js';
import { AUTH_OPTIONS, authOptionsFactory } from './auth-options.js';
import { AuthController } from './auth.controller.js';
import { CommandHandlers } from './commands/handlers/index.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { QueryHandlers } from './queries/handlers/index.js';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    CompaniesModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '8h') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_OPTIONS, inject: [ConfigService], useFactory: authOptionsFactory },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class AuthModule {}
