import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { getApiEnv } from '@/config/env';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly env = getApiEnv();

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
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
