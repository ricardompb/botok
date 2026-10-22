import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAccessLog } from './tenant-access-log.entity.js';
import { TenantContextInterceptor } from './tenant-context.interceptor.js';
import { TenantDb } from './tenant-db.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TenantAccessLog])],
  providers: [TenantDb, { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor }],
  exports: [TenantDb],
})
export class TenancyModule {}
