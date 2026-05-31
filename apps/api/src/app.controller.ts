import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiPublicErrors } from './swagger/decorators/api-protected.decorator';

@ApiTags('meta')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API metadata' })
  @ApiOkResponse({
    schema: {
      example: { name: 'Sadaf Gold API', status: 'ready', version: 'v1' },
    },
  })
  @ApiPublicErrors()
  getInfo() {
    return this.appService.getAppInfo();
  }
}
