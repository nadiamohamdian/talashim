import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { SubmitKycDto } from '../dto/submit-kyc.dto';
import { KycService } from '../services/kyc.service';

@ApiTags('kyc')
@ApiProtected()
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user KYC status' })
  getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.kycService.getStatus(user.id);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC verification request' })
  submit(@CurrentUser() user: AuthenticatedUser, @Body() payload: SubmitKycDto) {
    return this.kycService.submit(user, payload);
  }
}
