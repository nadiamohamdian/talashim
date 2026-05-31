import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipLogging } from '@/common/decorators/skip-logging.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@ApiPublicErrors()
@Public()
@SkipThrottle()
@SkipLogging()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check with database probe' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth() {
    return this.healthService.getHealth();
  }
}
