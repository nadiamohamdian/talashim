import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/modules/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
