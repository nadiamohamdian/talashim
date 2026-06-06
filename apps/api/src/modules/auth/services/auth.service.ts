import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { randomInt } from 'node:crypto';
import { getApiEnv } from '@/config/env';
import { isStaffRoleEnum } from '@talashim/shared/admin-rbac';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { assertFeatureEnabled } from '@/common/platform-settings/platform-settings-helpers';
import { KycRepository } from '@/modules/kyc/repositories/kyc.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { UsersService } from '@/modules/users/services/users.service';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';
import { DEV_STAFF_ACCOUNTS } from '../constants/dev-staff-accounts';

const OTP_TTL_SECONDS = 300;
const OTP_KEY_PREFIX = 'auth:otp:';

@Injectable()
export class AuthService {
  private readonly env = getApiEnv();
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly kycRepository: KycRepository,
  ) {}

  async register(payload: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(payload.email);

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const passwordHash = await argon2.hash(payload.password);
    const user = await this.usersService.createUser({
      email: payload.email,
      fullName: payload.fullName,
      passwordHash,
    });

    await this.authRepository.createAuditLog('auth.register', user.id);

    return this.issueSession(user.id, user.email, user.fullName, user.role);
  }

  async login(payload: LoginDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const devCustomerBypass = this.isDevCustomerLoginEnabled();
    const devStaffLogin = this.isDevStaffLoginEnabled();
    const staffSeed = DEV_STAFF_ACCOUNTS[normalizedEmail];

    let user = await this.usersService.findByEmail(normalizedEmail);

    if (staffSeed && devStaffLogin) {
      if (!user) {
        const passwordHash = await argon2.hash(
          payload.password || staffSeed.defaultPassword,
        );
        user = await this.usersService.createUser({
          email: normalizedEmail,
          fullName: staffSeed.fullName,
          passwordHash,
          role: staffSeed.role,
        });
      } else if (user.role !== staffSeed.role || user.fullName !== staffSeed.fullName) {
        user = await this.usersService.updateStaffAccount(user.id, {
          role: staffSeed.role,
          fullName: staffSeed.fullName,
        });
      }
    } else if (!user && devCustomerBypass) {
      const passwordHash = await argon2.hash(payload.password || 'Dev12345!');
      user = await this.usersService.createUser({
        email: normalizedEmail,
        fullName: payload.email.split('@')[0] || 'کاربر تست',
        passwordHash,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, payload.password);
    const devStaffBypass = devStaffLogin && isStaffRoleEnum(user.role);
    const devPasswordBypass = devCustomerBypass || devStaffBypass;

    if (!passwordMatches && !devPasswordBypass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.authRepository.createAuditLog(
      devPasswordBypass && !passwordMatches ? 'auth.login.dev' : 'auth.login',
      user.id,
    );

    return this.issueSession(user.id, user.email, user.fullName, user.role);
  }

  private isDevStaffLoginEnabled(): boolean {
    return process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_LOGIN !== 'false';
  }

  private isDevCustomerLoginEnabled(): boolean {
    return process.env.NODE_ENV !== 'production' && process.env.WEB_DEV_LOGIN !== 'false';
  }

  async refresh(refreshToken: string) {
    const decoded = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      fullName: string;
      role: string;
    }>(refreshToken, {
      secret: this.env.JWT_REFRESH_SECRET,
    });

    const tokens = await this.authRepository.findActiveRefreshTokens(
      decoded.sub,
    );
    const isValid = await Promise.any(
      tokens.map(async (token: { tokenHash: string }) =>
        argon2.verify(token.tokenHash, refreshToken),
      ),
    ).catch(() => false);

    if (!isValid) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    await this.authRepository.revokeAllRefreshTokens(decoded.sub);
    await this.authRepository.createAuditLog('auth.refresh', decoded.sub);

    return this.issueSession(
      decoded.sub,
      decoded.email,
      decoded.fullName,
      decoded.role,
    );
  }

  async logout(refreshToken: string) {
    const decoded = await this.jwtService.verifyAsync<{ sub: string }>(
      refreshToken,
      {
        secret: this.env.JWT_REFRESH_SECRET,
      },
    );

    await this.authRepository.revokeAllRefreshTokens(decoded.sub);
    await this.authRepository.createAuditLog('auth.logout', decoded.sub);

    return { success: true };
  }

  async requestOtp(identifier: string) {
    assertFeatureEnabled('enableOtpLogin', 'ورود با OTP غیرفعال است');
    const devCustomerBypass = this.isDevCustomerLoginEnabled();
    const user = devCustomerBypass
      ? await this.resolveOrCreateDevOtpUser(identifier)
      : await this.resolveUserByIdentifier(identifier);
    if (!user) {
      throw new BadRequestException('Account not found for this identifier');
    }

    const code = String(randomInt(100000, 999999));
    const key = this.otpKey(identifier);
    await this.redisService.set(key, await argon2.hash(code), OTP_TTL_SECONDS);

    if (this.env.NODE_ENV !== 'production') {
      this.logger.log(`OTP for ${identifier}: ${code}`);
    }

    await this.authRepository.createAuditLog(
      devCustomerBypass ? 'auth.otp_requested.dev' : 'auth.otp_requested',
      user.id,
    );

    return { success: true, expiresInSeconds: OTP_TTL_SECONDS };
  }

  async verifyOtp(identifier: string, code: string) {
    assertFeatureEnabled('enableOtpLogin', 'ورود با OTP غیرفعال است');
    if (this.isDevCustomerLoginEnabled()) {
      const user = await this.resolveOrCreateDevOtpUser(identifier);
      if (!user) {
        throw new UnauthorizedException('Account not found');
      }

      await this.redisService.del(this.otpKey(identifier));
      await this.authRepository.createAuditLog('auth.otp_verified.dev', user.id);
      return this.issueSession(user.id, user.email, user.fullName, user.role);
    }

    const key = this.otpKey(identifier);
    const storedHash = await this.redisService.get(key);
    if (!storedHash || !(await argon2.verify(storedHash, code))) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.resolveUserByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    await this.redisService.del(key);
    await this.authRepository.createAuditLog('auth.otp_verified', user.id);

    return this.issueSession(user.id, user.email, user.fullName, user.role);
  }

  private otpKey(identifier: string) {
    return `${OTP_KEY_PREFIX}${identifier.trim().toLowerCase()}`;
  }

  private async resolveUserByIdentifier(identifier: string) {
    const normalized = identifier.trim().toLowerCase();
    if (normalized.includes('@')) {
      return this.usersService.findByEmail(normalized);
    }
    const kyc = await this.kycRepository.findByPhone(normalized);
    if (!kyc) {
      return null;
    }
    return this.usersService.findById(kyc.userId);
  }

  private async resolveOrCreateDevOtpUser(identifier: string) {
    const normalized = identifier.trim().toLowerCase();
    const asEmail = normalized.includes('@')
      ? normalized
      : `${normalized.replace(/[^0-9a-z]/g, '') || 'test-user'}@dev.local`;

    const existing = await this.usersService.findByEmail(asEmail);
    if (existing) {
      return existing;
    }

    const passwordHash = await argon2.hash('Dev12345!');
    const fullName = normalized.includes('@')
      ? normalized.split('@')[0] || 'کاربر تست'
      : `کاربر ${normalized}`;

    return this.usersService.createUser({
      email: asEmail,
      fullName,
      passwordHash,
    });
  }

  private async issueSession(
    userId: string,
    email: string,
    fullName: string,
    role: string,
  ) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        fullName,
        role,
      },
      {
        secret: this.env.JWT_ACCESS_SECRET,
        expiresIn: this.env.JWT_ACCESS_TTL as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        fullName,
        role,
      },
      {
        secret: this.env.JWT_REFRESH_SECRET,
        expiresIn: this.env.JWT_REFRESH_TTL as never,
      },
    );

    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.authRepository.revokeAllRefreshTokens(userId);
    await this.authRepository.storeRefreshToken(
      userId,
      refreshTokenHash,
      refreshExpiry,
    );

    return {
      user: {
        id: userId,
        email,
        fullName,
        role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
