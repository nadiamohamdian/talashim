import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { randomBytes, randomInt } from 'node:crypto';
import { getApiEnv } from '@/config/env';
import { isStaffRoleEnum } from '@sadafgold/shared/admin-rbac';
import { normalizeIranMobile } from '@sadafgold/shared';
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
      requiresPasswordSetup: false,
    });

    await this.authRepository.createAuditLog('auth.register', user.id);

    return this.issueSession(user.id, user.email, user.fullName, user.role);
  }

  async login(payload: LoginDto) {
    const identifier = payload.identifier.trim().toLowerCase();
    const devCustomerBypass = this.isDevCustomerLoginEnabled();
    const devStaffLogin = this.isDevStaffLoginEnabled();
    const staffSeed = identifier.includes('@') ? DEV_STAFF_ACCOUNTS[identifier] : undefined;

    let user = await this.resolveUserByIdentifier(identifier);

    if (staffSeed && devStaffLogin) {
      if (!user) {
        const passwordHash = await argon2.hash(
          payload.password || staffSeed.defaultPassword,
        );
        user = await this.usersService.createUser({
          email: identifier,
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
      user = await this.resolveOrCreateOtpUser(identifier);
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

    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.authRepository.revokeAllRefreshTokens(decoded.sub);
    await this.authRepository.createAuditLog('auth.refresh', decoded.sub);

    return this.issueSession(
      user.id,
      user.email,
      user.fullName,
      user.role,
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
    const normalized = this.normalizeIdentifier(identifier);
    if (!normalized) {
      throw new BadRequestException('شماره موبایل معتبر وارد کنید');
    }

    const code = String(randomInt(100000, 999999));
    const key = this.otpKey(identifier);
    await this.redisService.set(key, await argon2.hash(code), OTP_TTL_SECONDS);

    if (this.env.NODE_ENV !== 'production') {
      this.logger.log(`OTP for ${normalized}: ${code}`);
    }

    const existingUser = await this.resolveUserByIdentifier(normalized);
    if (existingUser) {
      await this.authRepository.createAuditLog('auth.otp_requested', existingUser.id);
    }

    return { success: true, expiresInSeconds: OTP_TTL_SECONDS };
  }

  async verifyOtp(identifier: string, code: string) {
    assertFeatureEnabled('enableOtpLogin', 'ورود با OTP غیرفعال است');
    if (this.isDevCustomerLoginEnabled()) {
      const user = await this.resolveOrCreateOtpUser(identifier);
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

    const user = await this.resolveOrCreateOtpUser(identifier);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    await this.redisService.del(key);
    await this.authRepository.createAuditLog('auth.otp_verified', user.id);

    return this.issueSession(user.id, user.email, user.fullName, user.role);
  }

  private otpKey(identifier: string) {
    const normalized = this.normalizeIdentifier(identifier);
    return `${OTP_KEY_PREFIX}${normalized ?? identifier.trim().toLowerCase()}`;
  }

  private normalizeIdentifier(identifier: string): string | null {
    const trimmed = identifier.trim().toLowerCase();
    if (trimmed.includes('@')) {
      return trimmed;
    }

    return normalizeIranMobile(trimmed);
  }

  private phoneToCustomerEmail(phone: string) {
    return `${phone}@phone.talashim.local`;
  }

  private async resolveUserByIdentifier(identifier: string) {
    const normalized = identifier.trim().toLowerCase();
    if (normalized.includes('@')) {
      return this.usersService.findByEmail(normalized);
    }

    const phone = this.normalizeIdentifier(identifier);
    if (!phone) {
      return null;
    }

    const byUserPhone = await this.usersService.findByPhone(phone);
    if (byUserPhone) {
      return byUserPhone;
    }

    const kyc = await this.kycRepository.findByPhone(phone);
    if (!kyc) {
      return null;
    }
    return this.usersService.findById(kyc.userId);
  }

  private async resolveOrCreateOtpUser(identifier: string) {
    const normalized = this.normalizeIdentifier(identifier);
    if (!normalized) {
      return null;
    }

    const existing = await this.resolveUserByIdentifier(normalized);
    if (existing) {
      return existing;
    }

    const isEmail = normalized.includes('@');
    const phone = isEmail ? undefined : normalized;
    const email = isEmail ? normalized : this.phoneToCustomerEmail(phone!);
    const byEmail = await this.usersService.findByEmail(email);
    if (byEmail) {
      if (!byEmail.phone && phone) {
        await this.usersService.updateProfile(byEmail.id, { phone });
        return this.usersService.findById(byEmail.id);
      }
      return byEmail;
    }

    const passwordHash = await argon2.hash(randomBytes(32).toString('hex'));
    const fullName = phone
      ? `کاربر ${phone}`
      : normalized.split('@')[0] || 'کاربر جدید';

    const user = await this.usersService.createUser({
      email,
      fullName,
      passwordHash,
      phone,
      requiresPasswordSetup: true,
    });

    await this.authRepository.createAuditLog('auth.user_created.otp', user.id);
    return user;
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
