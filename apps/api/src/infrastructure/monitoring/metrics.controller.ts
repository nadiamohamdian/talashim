import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { MetricsService } from './metrics.service';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'In-process request metrics (monitoring hook)' })
  @ApiOkResponse({
    schema: {
      example: {
        uptimeSeconds: 3600,
        totalRequests: 1200,
        totalErrors: 3,
        avgDurationMs: 42.5,
      },
    },
  })
  @ApiPublicErrors()
  getMetrics() {
    return this.metricsService.getSnapshot();
  }
}
