import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getApiEnv } from '@/config/env';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { KycModule } from '@/modules/kyc/kyc.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: getApiEnv().JWT_ACCESS_SECRET,
    }),
    UsersModule,
    RedisModule,
    KycModule,
  ],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService],
  exports: [AuthService, AuthRepository, JwtModule],
})
export class AuthModule {}
