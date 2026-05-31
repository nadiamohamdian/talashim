import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { getAuthThrottleConfig } from '@/config/throttle.config';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { AuthSessionResponseDto } from '../dto/auth-session-response.dto';
import type { Request, Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { getApiEnv } from '@/config/env';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LoginDto } from '../dto/login.dto';
import { OtpRequestDto } from '../dto/otp-request.dto';
import { OtpVerifyDto } from '../dto/otp-verify.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Throttle(getAuthThrottleConfig())
@Controller('auth')
export class AuthController {
  private readonly env = getApiEnv();

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiOkResponse({ type: AuthSessionResponseDto, description: 'Session issued' })
  @ApiPublicErrors()
  async register(
    @Body() payload: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.register(payload);
    this.attachRefreshCookie(response, session.tokens.refreshToken);

    return session;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: AuthSessionResponseDto, description: 'Session issued' })
  @ApiPublicErrors()
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(payload);
    this.attachRefreshCookie(response, session.tokens.refreshToken);

    return session;
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate access token using refresh token' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiPublicErrors()
  async refresh(
    @Req() request: Request,
    @Body() payload: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      payload.refreshToken ??
      (request.cookies as { refreshToken?: string } | undefined)?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const session = await this.authService.refresh(refreshToken);
    this.attachRefreshCookie(response, session.tokens.refreshToken);

    return session;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh tokens and clear session' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiPublicErrors()
  async logout(
    @Req() request: Request,
    @Body() payload: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      payload.refreshToken ??
      (request.cookies as { refreshToken?: string } | undefined)?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    response.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.env.NODE_ENV === 'production',
      domain: this.env.COOKIE_DOMAIN,
      path: '/',
    });

    return { success: true };
  }

  @Public()
  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP for login' })
  @ApiOkResponse({ schema: { example: { success: true, expiresInSeconds: 300 } } })
  @ApiPublicErrors()
  requestOtp(@Body() payload: OtpRequestDto) {
    return this.authService.requestOtp(payload.identifier);
  }

  @Public()
  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and issue session' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiPublicErrors()
  async verifyOtp(
    @Body() payload: OtpVerifyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.verifyOtp(payload.identifier, payload.code);
    this.attachRefreshCookie(response, session.tokens.refreshToken);
    return session;
  }

  private attachRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.env.NODE_ENV === 'production',
      domain: this.env.COOKIE_DOMAIN,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}
